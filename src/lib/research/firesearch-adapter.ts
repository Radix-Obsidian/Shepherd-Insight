import { FirecrawlClient } from './firecrawl-client'
import { GroqClient, MindMapData } from './groq-client'
import { InsightData } from '@/types/insight'
import { z } from 'zod'
import { logger } from '@/lib/logger'

type ResearchFinding = Record<string, unknown>

function isObject(value: unknown): value is ResearchFinding {
  return typeof value === 'object' && value !== null
}

function getFindingUrl(finding: ResearchFinding): string | undefined {
  const candidate =
    (typeof finding.url === 'string' && finding.url) ||
    (typeof finding.link === 'string' && finding.link)
  return typeof candidate === 'string' ? candidate : undefined
}

function getFindingTitle(finding: ResearchFinding): string | undefined {
  const title = finding.title ?? finding.source ?? finding.name
  return typeof title === 'string' ? title : undefined
}

function getFindingSnippet(finding: ResearchFinding): string | undefined {
  const snippet = finding.snippet ?? finding.description
  return typeof snippet === 'string' ? snippet : undefined
}

function getFindingContent(finding: ResearchFinding): string | undefined {
  const content = finding.content ?? finding.markdown
  if (typeof content === 'string') {
    return content
  }
  if (Array.isArray(content)) {
    return content.filter(item => typeof item === 'string').join('\n')
  }
  return undefined
}

function addFinding(target: ResearchFinding[], value: unknown) {
  if (isObject(value)) {
    target.push(value)
  }
}

function addFindings(target: ResearchFinding[], value: unknown) {
  if (Array.isArray(value)) {
    value.forEach(item => addFinding(target, item))
  } else {
    addFinding(target, value)
  }
}

interface ResearchOptions {
  query: string
  depth?: number
  competitorUrls?: string[]
  includeWebhook?: boolean
  webhookUrl?: string
}

interface ResearchState {
  status: 'pending' | 'running' | 'completed' | 'failed'
  currentStep: string
  progress: number
  findings: ResearchFinding[]
  insight: InsightData | null
  error?: string
}

function extractJobId(result: unknown): string {
  if (isObject(result)) {
    if (typeof result.jobId === 'string') return result.jobId
    if (typeof result.id === 'string') return result.id
  }
  return 'unknown'
}

// Zod schema for structured insight generation
const InsightSchema = z.object({
  pain_points: z.array(z.object({
    id: z.string(),
    description: z.string(),
    severity: z.enum(['low', 'medium', 'high']),
    frequency: z.number(),
    sources: z.array(z.string())
  })),
  competitors: z.array(z.object({
    name: z.string(),
    url: z.string(),
    pricing: z.string(),
    features: z.array(z.string()),
    weaknesses: z.array(z.string())
  })),
  opportunities: z.array(z.object({
    id: z.string(),
    description: z.string(),
    market_size: z.string(),
    competition_level: z.enum(['low', 'medium', 'high']),
    sources: z.array(z.string())
  })),
  MVP_features: z.array(z.string()),
  out_of_scope: z.array(z.string()),
  personas: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    pain_points: z.array(z.string()),
    goals: z.array(z.string()),
    demographics: z.object({
      age_range: z.string(),
      income: z.string(),
      location: z.string()
    })
  })),
  citations: z.array(z.object({
    id: z.string(),
    url: z.string(),
    title: z.string(),
    snippet: z.string(),
    relevance_score: z.number()
  }))
})

export class FiresearchAdapter {
  private firecrawl: FirecrawlClient
  private groq: GroqClient
  private state: ResearchState
  private onProgressUpdate?: (state: ResearchState) => void

  constructor(onProgressUpdate?: (state: ResearchState) => void) {
    this.firecrawl = new FirecrawlClient()
    this.groq = new GroqClient()
    this.state = {
      status: 'pending',
      currentStep: 'Initializing',
      progress: 0,
      findings: [],
      insight: null
    }
    this.onProgressUpdate = onProgressUpdate
  }

  private updateProgress(step: string, progress: number, status: ResearchState['status'] = 'running', error?: string) {
    this.state = {
      ...this.state,
      currentStep: step,
      progress,
      status,
      error
    }
    this.onProgressUpdate?.(this.state)
    
    if (error) {
      logger.error(`Firesearch Error at step "${step}"`, error)
    } else {
      logger.debug(`Firesearch Progress: ${step} (${progress}%)`)
    }
  }

  async run(options: ResearchOptions): Promise<InsightData> {
    try {
      this.updateProgress('Starting Firesearch workflow...', 0)

      // Step 1: Use Firecrawl search for initial discovery
      this.updateProgress('Searching web for market information...', 10)
      const searchResults = await this.firecrawl.search(options.query, {
        limit: 10
      })
      
      if (Array.isArray(searchResults?.data)) {
        addFindings(this.state.findings, searchResults.data)
      }

      // Step 2: Scrape competitor URLs if provided
      if (options.competitorUrls && options.competitorUrls.length > 0) {
        this.updateProgress('Scraping competitor websites...', 30)
        
        try {
          const competitorData = await this.firecrawl.batchScrapeUrls(options.competitorUrls, {
            formats: ['markdown'],
            onlyMainContent: true
          })
          
          if (Array.isArray(competitorData.data)) {
            addFindings(this.state.findings, competitorData.data)
          }
        } catch (error) {
          logger.warn('Some competitor URLs failed to scrape', error)
          // Continue with partial data
        }
      }

      // Step 3: Use Firesearch for intelligent extraction and analysis
      this.updateProgress('Running Firesearch analysis...', 50)
      
      // Define extraction schema for competitor analysis
      const CompetitorExtractionSchema = z.object({
        companyName: z.string(),
        keyFeatures: z.array(z.string()),
        pricingModel: z.string().optional(),
        strengths: z.array(z.string()),
        weaknesses: z.array(z.string()),
        targetAudience: z.string().optional()
      })

      // Extract from top competitor URLs using Firesearch
      const topUrls = this.state.findings
        .map(getFindingUrl)
        .filter((url): url is string => typeof url === 'string' && url.includes('http'))
        .slice(0, 3)

      if (topUrls.length > 0) {
        try {
          const extractedData = await this.firecrawl.extract(topUrls, CompetitorExtractionSchema)
          addFindings(this.state.findings, extractedData)
        } catch (error) {
          logger.warn('Firesearch extraction failed', error)
          // Continue with unstructured data
        }
      }

      // Step 4: Generate insights using Groq with Firesearch-enhanced data
      this.updateProgress('Generating AI insights with Firesearch...', 70)
      
      const insights = await this.groq.generateStructuredInsights(
        this.state.findings,
        options.query,
        InsightSchema
      )

      this.state.insight = insights

      // Step 5: Generate citations from findings
      this.updateProgress('Generating citations...', 90)
      
      const citations = this.state.findings
        .map((finding, index) => {
          const url = getFindingUrl(finding)
          const snippet = getFindingSnippet(finding)
          const content = getFindingContent(finding)
          if (!url || (!snippet && !content)) {
            return null
          }
          return {
            id: `citation-${index}`,
            url,
            title: getFindingTitle(finding) || 'Untitled',
            snippet: snippet ?? content?.slice(0, 200) ?? 'No snippet available',
            relevance_score: Math.random() * 0.5 + 0.5,
          }
        })
        .filter((citation): citation is NonNullable<typeof citation> => Boolean(citation))
        .slice(0, 10)
        .map((citation, index) => ({ ...citation, id: `citation-${index}` }))

      // Add citations to insights
      this.state.insight.citations = citations

      this.updateProgress('Firesearch workflow completed successfully!', 100, 'completed')
      
      return this.state.insight

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Firesearch workflow failed'
      this.updateProgress('Firesearch workflow failed', 0, 'failed', message)
      throw error
    }
  }

  /**
   * Run research with webhook support for async operations
   */
  async runAsync(options: ResearchOptions & { webhookUrl: string }): Promise<string> {
    try {
      this.updateProgress('Starting async Firesearch with webhook...', 0)

      // Start crawl with webhook
      const crawlResult = await this.firecrawl.crawl(options.query, {
        limit: 50,
        webhook: {
          url: options.webhookUrl,
          events: ['started', 'page', 'completed'],
          metadata: {
            query: options.query,
            timestamp: new Date().toISOString()
          }
        }
      })

      this.updateProgress('Firesearch crawl initiated with webhook', 20)
      
      // Return job ID for tracking
      return extractJobId(crawlResult)

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Async Firesearch failed'
      this.updateProgress('Async Firesearch failed', 0, 'failed', message)
      throw error
    }
  }

  /**
   * Convert insights to mind map format using Firesearch-enhanced data
   */
  async generateMindMap(): Promise<MindMapData> {
    if (!this.state.insight) {
      throw new Error('No insights available. Run research first.')
    }

    try {
      this.updateProgress('Converting Firesearch insights to mind map...', 95)
      
      const mindMapData = await this.groq.insightsToMindMap(this.state.insight)
      
      this.updateProgress('Mind map generated from Firesearch data', 100)
      
      return mindMapData
    } catch (error: unknown) {
      logger.error('Mind map generation failed', error)
      throw error
    }
  }

  getState(): ResearchState {
    return { ...this.state }
  }
}
