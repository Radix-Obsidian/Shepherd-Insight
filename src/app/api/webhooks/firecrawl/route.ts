import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { logger } from '@/lib/logger'
import { getSupabaseEdgeFunctionUrl } from '@/lib/supabase-edge'
import type { SupabaseClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Simple in-memory rate limiter: 5 requests per minute per IP
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute in milliseconds
const RATE_LIMIT_MAX = 5

function getClientIP(request: NextRequest): string {
  // Get IP from headers (works with Vercel)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const clientIP = request.headers.get('x-client-ip')

  // Return the first available IP, fallback to 'unknown'
  return forwarded?.split(',')[0]?.trim() ||
         realIP ||
         clientIP ||
         'unknown'
}

function checkRateLimit(ip: string): { allowed: boolean; resetIn: number } {
  const now = Date.now()
  const existing = rateLimitStore.get(ip)

  if (!existing || now > existing.resetAt) {
    // First request or window expired
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return { allowed: true, resetIn: RATE_LIMIT_WINDOW }
  }

  if (existing.count >= RATE_LIMIT_MAX) {
    // Rate limit exceeded
    return { allowed: false, resetIn: existing.resetAt - now }
  }

  // Increment counter
  existing.count++
  rateLimitStore.set(ip, existing)
  return { allowed: true, resetIn: existing.resetAt - now }
}

// Clean up expired entries periodically (simple cleanup)
setInterval(() => {
  const now = Date.now()
  
  // Convert iterator to array explicitly so TS doesn't need downlevelIteration
  const entries = Array.from(rateLimitStore.entries())
  
  for (let i = 0; i < entries.length; i++) {
    const ip = entries[i][0]
    const data = entries[i][1]
    
    if (now > data.resetAt) {
      rateLimitStore.delete(ip)
    }
  }
}, RATE_LIMIT_WINDOW)

interface FirecrawlEventData {
  jobId: string
  url?: string
  error?: string
  [key: string]: unknown
}

interface FirecrawlEvent {
  type: string
  data: FirecrawlEventData
}

interface InsightJobRecord {
  id: string
  job_id: string
  query: string | null
  project_id: string | null
  user_id: string
}

interface UserProfile {
  email: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isFirecrawlEvent(value: unknown): value is FirecrawlEvent {
  if (!isRecord(value)) return false
  const { type, data } = value
  if (typeof type !== 'string' || !isRecord(data)) {
    return false
  }
  return typeof data.jobId === 'string'
}

function isInsightJobRecord(value: unknown): value is InsightJobRecord {
  if (!isRecord(value)) return false
  return (
    typeof value.id === 'string' &&
    typeof value.job_id === 'string' &&
    'user_id' in value &&
    typeof value.user_id === 'string'
  )
}

function isUserProfile(value: unknown): value is UserProfile {
  return isRecord(value) && typeof value.email === 'string'
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 requests per minute per IP
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP)

    if (!rateLimitResult.allowed) {
      logger.warn(`Rate limit exceeded for IP: ${clientIP}`)
      const resetInSeconds = Math.ceil(rateLimitResult.resetIn / 1000)
      return new Response(`Too Many Requests. Reset in ${resetInSeconds}s`, {
        status: 429,
        headers: {
          'Retry-After': resetInSeconds.toString(),
          'X-RateLimit-Reset': new Date(Date.now() + rateLimitResult.resetIn).toISOString()
        }
      })
    }

    // Create Supabase client inside handler (no top-level env reads)
    const supabase = createSupabaseServerClient()
    
    // Read env vars inside handler
    const webhookSecret = process.env.FIRECRAWL_WEBHOOK_SECRET
    const NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL
    const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY

    // Verify webhook signature
    const signature = request.headers.get('X-Firecrawl-Signature')

    if (!signature || !webhookSecret) {
      logger.warn('Missing webhook signature or secret')
      return new Response('Unauthorized', { status: 401 })
    }

    // Get raw body for signature verification
    const body = await request.text()
    
    // Extract hash from signature header
    const signatureParts = signature.split('=')
    if (signatureParts.length !== 2) {
      logger.warn('Invalid signature header format')
      return new Response('Unauthorized', { status: 401 })
    }

    const [algorithm, hash] = signatureParts
    if (algorithm !== 'sha256' || !hash) {
      logger.warn(`Invalid signature algorithm: ${algorithm}`)
      return new Response('Unauthorized', { status: 401 })
    }

    // Compute expected signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex')

    // Verify signature using timing-safe comparison
    if (!crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(expectedSignature, 'hex'))) {
      logger.warn('Invalid webhook signature - hash mismatch')
      return new Response('Unauthorized', { status: 401 })
    }

    // Parse verified webhook payload
    const parsedEvent = JSON.parse(body) as unknown
    if (!isFirecrawlEvent(parsedEvent)) {
      logger.error('Invalid webhook payload structure')
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const event = parsedEvent
    logger.debug('Verified Firecrawl webhook', event)

    // Handle different event types (pass supabase client and env vars to handlers)
    switch (event.type) {
      case 'crawl.started':
        await handleCrawlStarted(event, supabase)
        break
      
      case 'crawl.page':
        await handleCrawlPage(event, supabase)
        break
      
      case 'crawl.completed':
        await handleCrawlCompleted(event, supabase, NEXT_PUBLIC_SITE_URL, INTERNAL_API_KEY)
        break
      
      case 'crawl.failed':
        await handleCrawlFailed(event, supabase)
        break
      
      case 'batch.started':
        await handleBatchStarted(event, supabase)
        break
      
      case 'batch.page':
        await handleBatchPage(event, supabase)
        break
      
      case 'batch.completed':
        await handleBatchCompleted(event, supabase)
        break
      
      case 'extract.started':
        await handleExtractStarted(event, supabase)
        break
      
      case 'extract.completed':
        await handleExtractCompleted(event, supabase)
        break
      
      case 'extract.failed':
        await handleExtractFailed(event, supabase)
        break
      
      default:
        logger.debug('Unhandled webhook event type:', event.type)
    }

    // Always respond with 200 to acknowledge receipt
    return NextResponse.json({ received: true })

  } catch (error: unknown) {
    logger.error('Webhook processing error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleCrawlStarted(event: FirecrawlEvent, supabase: SupabaseClient) {
  logger.debug('Crawl started', event.data.jobId)
  
  // Update job status in Supabase
  try {
    await supabase
      .from('insight_jobs')
      .update({
        status: 'running',
        current_step: 'Crawl started',
        progress_steps: ['Crawl started'],
        updated_at: new Date().toISOString()
      })
      .eq('job_id', event.data.jobId)
  } catch (error) {
    logger.error('Failed to update crawl started status', error)
  }
}

async function handleCrawlPage(event: FirecrawlEvent, supabase: SupabaseClient) {
  logger.debug('Crawl page completed', event.data.url)
  
  // Update progress for each page crawled
  try {
    await supabase
      .from('insight_jobs')
      .update({
        current_step: `Crawled: ${event.data.url}`,
        updated_at: new Date().toISOString()
      })
      .eq('job_id', event.data.jobId)
  } catch (error) {
    logger.error('Failed to update crawl page status', error)
  }
}

async function handleCrawlCompleted(
  event: FirecrawlEvent, 
  supabase: SupabaseClient,
  NEXT_PUBLIC_SITE_URL: string | undefined,
  INTERNAL_API_KEY: string | undefined
) {
  logger.debug('Crawl completed', event.data.jobId)
  
  try {
    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('insight_jobs')
      .select('*')
      .eq('job_id', event.data.jobId)
      .single()

    if (jobError || !isInsightJobRecord(job)) {
      logger.error('Failed to fetch job', jobError)
      return
    }

    // Update job status
    await supabase
      .from('insight_jobs')
      .update({
        status: 'running',
        current_step: 'Generating insights from crawl data',
        progress_steps: ['Crawl completed', 'Generating insights'],
        updated_at: new Date().toISOString()
      })
      .eq('job_id', event.data.jobId)

    // Trigger insight generation
    await triggerInsightGeneration(job, event.data, supabase, NEXT_PUBLIC_SITE_URL, INTERNAL_API_KEY)

    // Send notification
    await sendCompletionNotification(job, 'crawl', supabase)
    
  } catch (error) {
    logger.error('Failed to handle crawl completion', error)
  }
}

async function handleCrawlFailed(event: FirecrawlEvent, supabase: SupabaseClient) {
  logger.debug('Crawl failed', event.data.jobId, event.data.error)
  
  try {
    await supabase
      .from('insight_jobs')
      .update({
        status: 'failed',
        current_step: 'Crawl failed',
        error: event.data.error,
        updated_at: new Date().toISOString()
      })
      .eq('job_id', event.data.jobId)
  } catch (error) {
    logger.error('Failed to update crawl failed status', error)
  }
}

async function handleBatchStarted(event: FirecrawlEvent, supabase: SupabaseClient) {
  logger.debug('Batch scrape started', event.data.jobId)
  
  try {
    await supabase
      .from('insight_jobs')
      .update({
        status: 'running',
        current_step: 'Batch scrape started',
        progress_steps: ['Batch scrape started'],
        updated_at: new Date().toISOString()
      })
      .eq('job_id', event.data.jobId)
  } catch (error) {
    logger.error('Failed to update batch started status', error)
  }
}

async function handleBatchPage(event: FirecrawlEvent, supabase: SupabaseClient) {
  logger.debug('Batch page completed', event.data.url)
  
  try {
    await supabase
      .from('insight_jobs')
      .update({
        current_step: `Scraped: ${event.data.url}`,
        updated_at: new Date().toISOString()
      })
      .eq('job_id', event.data.jobId)
  } catch (error) {
    logger.error('Failed to update batch page status', error)
  }
}

async function handleBatchCompleted(event: FirecrawlEvent, supabase: SupabaseClient) {
  logger.debug('Batch scrape completed', event.data.jobId)
  
  try {
    await supabase
      .from('insight_jobs')
      .update({
        status: 'completed',
        current_step: 'Batch scrape completed',
        progress_steps: ['Batch scrape completed'],
        updated_at: new Date().toISOString()
      })
      .eq('job_id', event.data.jobId)
  } catch (error) {
    logger.error('Failed to update batch completed status', error)
  }
}

async function handleExtractStarted(event: FirecrawlEvent, supabase: SupabaseClient) {
  logger.debug('Extract started', event.data.jobId)
  
  try {
    await supabase
      .from('insight_jobs')
      .update({
        status: 'running',
        current_step: 'Extract started',
        progress_steps: ['Extract started'],
        updated_at: new Date().toISOString()
      })
      .eq('job_id', event.data.jobId)
  } catch (error) {
    logger.error('Failed to update extract started status', error)
  }
}

async function handleExtractCompleted(event: FirecrawlEvent, supabase: SupabaseClient) {
  logger.debug('Extract completed', event.data.jobId)
  
  try {
    await supabase
      .from('insight_jobs')
      .update({
        status: 'completed',
        current_step: 'Extract completed',
        progress_steps: ['Extract completed'],
        updated_at: new Date().toISOString()
      })
      .eq('job_id', event.data.jobId)
  } catch (error) {
    logger.error('Failed to update extract completed status', error)
  }
}

async function handleExtractFailed(event: FirecrawlEvent, supabase: SupabaseClient) {
  logger.debug('Extract failed', event.data.jobId, event.data.error)
  
  try {
    await supabase
      .from('insight_jobs')
      .update({
        status: 'failed',
        current_step: 'Extract failed',
        error: event.data.error,
        updated_at: new Date().toISOString()
      })
      .eq('job_id', event.data.jobId)
  } catch (error) {
    logger.error('Failed to update extract failed status', error)
  }
}

/**
 * Trigger insight generation from crawl data
 */
async function triggerInsightGeneration(
  job: InsightJobRecord, 
  crawlData: FirecrawlEventData,
  supabase: SupabaseClient,
  NEXT_PUBLIC_SITE_URL: string | undefined,
  INTERNAL_API_KEY: string | undefined
) {
  try {
    logger.debug('Triggering insight generation for job', job.id)

    // Call the research API to generate insights
    // Use relative path for same-origin requests, or build full URL if needed
    const researchUrl = NEXT_PUBLIC_SITE_URL 
      ? `${NEXT_PUBLIC_SITE_URL}/api/research/run`
      : '/api/research/run'
    
    const response = await fetch(researchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${INTERNAL_API_KEY || ''}`
      },
      body: JSON.stringify({
        query: job.query,
        projectId: job.project_id,
        jobId: job.id,
        crawlData: crawlData,
        async: true
      })
    })

    if (!response.ok) {
      throw new Error(`Insight generation failed: ${response.statusText}`)
    }

    const result = await response.json()
    logger.debug('Insight generation triggered successfully', result)

  } catch (error) {
    logger.error('Failed to trigger insight generation', error)
    
    // Update job with error
    await supabase
      .from('insight_jobs')
      .update({
        status: 'failed',
        current_step: 'Insight generation failed',
        error: error instanceof Error ? error.message : String(error),
        updated_at: new Date().toISOString()
      })
      .eq('id', job.id)
  }
}

/**
 * Send completion notification
 */
async function sendCompletionNotification(
  job: InsightJobRecord, 
  type: 'crawl' | 'extract' | 'batch',
  supabase: SupabaseClient
) {
  try {
    // Get user email
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', job.user_id)
      .single()

    if (userError || !isUserProfile(user)) {
      logger.error('Failed to fetch user', userError)
      return
    }

    // Read SUPABASE_SERVICE_ROLE_KEY inside function (no top-level env reads)
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

    // Send email notification via Supabase Edge Function
    const notificationUrl = getSupabaseEdgeFunctionUrl('send-notification')
    const notificationResponse = await fetch(notificationUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY || ''}`
      },
      body: JSON.stringify({
        to: user.email,
        subject: `Research ${type} completed`,
        template: 'research-completion',
        data: {
          jobId: job.id,
          query: job.query,
          type: type,
          completedAt: new Date().toISOString()
        }
      })
    })

    if (!notificationResponse.ok) {
      logger.error('Failed to send notification', await notificationResponse.text())
    } else {
      logger.debug('Notification sent successfully')
    }

  } catch (error) {
    logger.error('Failed to send completion notification', error)
  }
}
