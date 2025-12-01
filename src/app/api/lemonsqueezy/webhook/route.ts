/**
 * Lemon Squeezy Webhook Handler
 * 
 * Handles subscription events from Lemon Squeezy.
 * Based on: https://docs.lemonsqueezy.com/guides/tutorials/webhooks-nextjs
 * 
 * Configure webhook URL in Lemon Squeezy Dashboard:
 * https://your-domain.com/api/lemonsqueezy/webhook
 * 
 * Enable these events:
 * - subscription_created
 * - subscription_updated
 * - subscription_cancelled
 * - subscription_resumed
 * - subscription_expired
 * - subscription_paused
 * - subscription_unpaused
 * - order_created (for lifetime deals)
 */

import crypto from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'

// Webhook event types we care about
type WebhookEventName = 
  | 'subscription_created'
  | 'subscription_updated'
  | 'subscription_cancelled'
  | 'subscription_resumed'
  | 'subscription_expired'
  | 'subscription_paused'
  | 'subscription_unpaused'
  | 'order_created'

interface WebhookPayload {
  meta: {
    event_name: WebhookEventName
    custom_data?: {
      user_id?: string
    }
  }
  data: {
    id: string
    type: string
    attributes: {
      user_email: string
      user_name: string
      status: string
      status_formatted: string
      product_id: number
      variant_id: number
      renews_at: string | null
      ends_at: string | null
      created_at: string
      updated_at: string
      urls: {
        customer_portal: string
        update_payment_method: string
      }
    }
  }
}

export async function POST(request: NextRequest) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET

  if (!secret) {
    console.error('LEMONSQUEEZY_WEBHOOK_SECRET not configured')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  // Get the raw body for signature verification
  const rawBody = await request.text()
  
  // Verify signature - per official docs
  const signature = Buffer.from(
    request.headers.get('X-Signature') ?? '',
    'hex'
  )

  if (signature.length === 0 || rawBody.length === 0) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }

  const hmac = Buffer.from(
    crypto.createHmac('sha256', secret).update(rawBody).digest('hex'),
    'hex'
  )

  if (!crypto.timingSafeEqual(hmac, signature)) {
    console.error('Invalid webhook signature')
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  // Parse the webhook data
  const data = JSON.parse(rawBody) as WebhookPayload
  const eventName = data.meta.event_name
  const userId = data.meta.custom_data?.user_id
  const attributes = data.data.attributes

  console.log(`📬 Lemon Squeezy webhook: ${eventName}`, {
    userId,
    email: attributes.user_email,
    status: attributes.status,
  })

  // Handle the event
  try {
    switch (eventName) {
      case 'subscription_created':
      case 'subscription_resumed':
      case 'subscription_unpaused':
        // User upgraded to Pro
        console.log(`✅ User ${userId} subscribed: ${attributes.status}`)
        // TODO: Update user subscription in Supabase
        // await updateUserTier(userId, 'pro', attributes)
        break

      case 'subscription_updated':
        console.log(`📝 User ${userId} subscription updated: ${attributes.status}`)
        // TODO: Sync subscription status
        break

      case 'subscription_cancelled':
      case 'subscription_expired':
        // User downgraded
        console.log(`❌ User ${userId} subscription ended: ${attributes.status}`)
        // TODO: Downgrade user to free tier
        // await updateUserTier(userId, 'free', attributes)
        break

      case 'subscription_paused':
        console.log(`⏸️ User ${userId} subscription paused`)
        // TODO: Handle paused state
        break

      case 'order_created':
        // Could be lifetime deal
        console.log(`🎉 Order created for user ${userId}`)
        // TODO: Check if lifetime and update accordingly
        break

      default:
        console.log(`Unhandled event: ${eventName}`)
    }

    // Always return 200 quickly per Lemon Squeezy docs
    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('Error processing webhook:', error)
    // Still return 200 to prevent retries, log error for debugging
    return NextResponse.json({ received: true, error: 'Processing error' }, { status: 200 })
  }
}
