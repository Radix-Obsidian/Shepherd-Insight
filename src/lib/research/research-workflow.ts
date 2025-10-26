import { FirecrawlClient } from './firecrawl-client'
import { GroqClient } from './groq-client'
import { InsightData, PainPoint, Competitor, Opportunity, Persona } from '@/types/insight'
import { z } from 'zod'

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
  findings: any[]
  insight: InsightData | null
  error?: string
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

export class ResearchWorkflow {
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
      console.error(`Research Error at step "${step}":`, error)
    } else {
      console.log(`Research Progress: ${step} (${progress}%)`)
    }
  }

  async run(options: ResearchOptions): Promise<InsightData> {
    try {
      this.updateProgress('Starting research workflow...', 0)

      // Step 1: Search for general information
      this.updateProgress('Searching web for market information...', 10)
      const searchResults = await this.firecrawl.search(options.query, {
        limit: 10
      })
      
      // Add search results to findings
      if (searchResults && Array.isArray(searchResults)) {
        this.state.findings.push(...searchResults)
      } else if (searchResults && typeof searchResults === 'object') {
        // Handle different response formats
        const results = (searchResults as any).results || (searchResults as any).data || []
        if (Array.isArray(results)) {
          this.state.findings.push(...results)
        }
      }

      // Step 2: Scrape competitor URLs if provided
      if (options.competitorUrls && options.competitorUrls.length > 0) {
        this.updateProgress('Scraping competitor websites...', 30)
        
        try {
          const competitorData = await this.firecrawl.batchScrapeUrls(options.competitorUrls, {
            formats: ['markdown'],
            onlyMainContent: true
          })
          
          if (competitorData.data) {
            this.state.findings.push(...competitorData.data)
          }
        } catch (error) {
          console.warn('Some competitor URLs failed to scrape:', error)
          // Continue with partial data
        }
      }

      // Step 3: Extract structured data from key findings
      this.updateProgress('Extracting structured insights...', 50)
      
      // Define extraction schema for competitor analysis
      const CompetitorExtractionSchema = z.object({
        companyName: z.string(),
        keyFeatures: z.array(z.string()),
        pricingModel: z.string().optional(),
        strengths: z.array(z.string()),
        weaknesses: z.array(z.string()),
        targetAudience: z.string().optional()
      })

      // Extract from top competitor URLs
      const topUrls = this.state.findings
        .filter(f => f.url && f.url.includes('http'))
        .slice(0, 3)
        .map(f => f.url)

      if (topUrls.length > 0) {
        try {
          const extractedData = await this.firecrawl.extract(topUrls, CompetitorExtractionSchema)
          if (extractedData && Array.isArray(extractedData)) {
            this.state.findings.push(...extractedData)
          } else if (extractedData && typeof extractedData === 'object') {
            const data = (extractedData as any).data || []
            if (Array.isArray(data)) {
              this.state.findings.push(...data)
            }
          }
        } catch (error) {
          console.warn('Structured extraction failed:', error)
          // Continue with unstructured data
        }
      }

      // Step 4: Generate insights using Groq
      this.updateProgress('Generating AI insights...', 70)
      
      const insights = await this.groq.generateStructuredInsights(
        this.state.findings,
        options.query,
        InsightSchema
      )

      this.state.insight = insights

      // Step 5: Generate citations from findings
      this.updateProgress('Generating citations...', 90)
      
      const citations = this.state.findings
        .filter(f => f.url && f.snippet)
        .slice(0, 10)
        .map((f, index) => ({
          id: `citation-${index}`,
          url: f.url,
          title: f.title || 'Untitled',
          snippet: f.snippet || f.content?.substring(0, 200) || 'No snippet available',
          relevance_score: Math.random() * 0.5 + 0.5 // Mock relevance score
        }))

      // Add citations to insights
      this.state.insight.citations = citations

      this.updateProgress('Research completed successfully!', 100, 'completed')
      
      return this.state.insight

    } catch (error: any) {
      this.updateProgress('Research failed', 0, 'failed', error.message)
      throw error
    }
  }

  /**
   * Run research with webhook support for async operations
   */
  async runAsync(options: ResearchOptions & { webhookUrl: string }): Promise<string> {
    try {
      this.updateProgress('Starting async research with webhook...', 0)

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

      this.updateProgress('Crawl initiated with webhook', 20)
      
      // Return job ID for tracking
      return (crawlResult as any).jobId || (crawlResult as any).id || 'unknown'

    } catch (error: any) {
      this.updateProgress('Async research failed', 0, 'failed', error.message)
      throw error
    }
  }

  /**
   * Convert insights to mind map format
   */
  async generateMindMap(): Promise<{ nodes: any[], edges: any[] }> {
    if (!this.state.insight) {
      throw new Error('No insights available. Run research first.')
    }

    try {
      this.updateProgress('Converting insights to mind map...', 95)
      
      const mindMapData = await this.groq.insightsToMindMap(this.state.insight)
      
      this.updateProgress('Mind map generated', 100)
      
      return mindMapData
    } catch (error: any) {
      console.error('Mind map generation failed:', error)
      throw error
    }
  }

  getState(): ResearchState {
    return { ...this.state }
  }
}