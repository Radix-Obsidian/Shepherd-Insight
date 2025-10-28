import FirecrawlApp from '@mendable/firecrawl-js'
import { z } from 'zod'
import { getApiKey } from '@/lib/api-key-manager'
import { logger } from '@/lib/logger'

export interface FirecrawlSearchItem {
  url?: string
  link?: string
  title?: string
  source?: string
  description?: string
  snippet?: string
  content?: string
}

export interface FirecrawlSearchResponse {
  data?: FirecrawlSearchItem[]
}

export interface FirecrawlScrapeData {
  title?: string
  content?: string | string[]
  markdown?: string
}

export interface FirecrawlScrapeResponse {
  data?: FirecrawlScrapeData
}

export interface SearchOptions {
  limit?: number
}

export type FirecrawlFormat = 'html' | 'markdown' | 'rawHtml' | 'screenshot'

export interface ScrapeOptions {
  formats?: FirecrawlFormat[]
  includeRawHtml?: boolean
  onlyMainContent?: boolean
}

export interface ExtractOptions {
  formats?: string[]
}

export interface CrawlOptions {
  limit?: number
  scrapeOptions?: ScrapeOptions
  webhook?: {
    url: string
    events?: string[]
    metadata?: Record<string, string>
  }
}

export class FirecrawlClient {
  private app: FirecrawlApp | null = null

  constructor() {
    // App will be initialized when needed
  }

  private async initializeApp() {
    if (!this.app) {
      const apiKey = await getApiKey('FIRECRAWL_API_KEY')
      this.app = new FirecrawlApp({ apiKey })
    }
  }

  /**
   * Search the web using Firecrawl's search API
   * Official docs: https://docs.firecrawl.dev/features/search
   */
  async search(query: string, options: SearchOptions = {}): Promise<FirecrawlSearchResponse> {
    try {
      await this.initializeApp()
      const { limit = 5 } = options

      const result = await this.app!.search(query, {
        limit,
      })

      return result as FirecrawlSearchResponse
    } catch (error) {
      logger.error('Firecrawl search error:', error)
      throw new Error(`Search failed: ${error}`)
    }
  }

  /**
   * Scrape a single URL using Firecrawl's scrape API
   * Official docs: https://docs.firecrawl.dev/features/scrape
   */
  async scrapeUrl(url: string, options: ScrapeOptions = {}): Promise<FirecrawlScrapeResponse> {
    try {
      await this.initializeApp()
      const { 
        formats = ['markdown'], 
        includeRawHtml = false,
        onlyMainContent = true 
      } = options

      const result = await this.app!.scrape(url, {
        formats: formats as FirecrawlFormat[] & string[],
        includeRawHtml,
        onlyMainContent,
      })
      
      return result as FirecrawlScrapeResponse
    } catch (error) {
      logger.error('Firecrawl scrape error:', error)
      throw new Error(`Scrape failed: ${error}`)
    }
  }

  /**
   * Batch scrape multiple URLs efficiently
   * Official docs: https://docs.firecrawl.dev/features/batch-scrape
   */
  async batchScrapeUrls(
    urls: string[],
    options: ScrapeOptions = {}
  ): Promise<{ data: FirecrawlScrapeResponse[] }> {
    try {
      await this.initializeApp()
      const { 
        formats = ['markdown'], 
        includeRawHtml = false,
        onlyMainContent = true 
      } = options

      // Use individual scrape calls for now to avoid type issues
      const results: FirecrawlScrapeResponse[] = []
      for (const url of urls) {
        try {
          const result = await this.scrapeUrl(url, { formats, includeRawHtml, onlyMainContent })
          results.push(result)
        } catch (error) {
          logger.warn(`Failed to scrape ${url}:`, error)
        }
      }
      
      return { data: results }
    } catch (error) {
      logger.error('Firecrawl batch scrape error:', error)
      throw new Error(`Batch scrape failed: ${error}`)
    }
  }

  /**
   * Extract structured data from URLs using LLM
   * Official docs: https://docs.firecrawl.dev/features/extract
   */
  async extract(
    urls: string[],
    schema: z.ZodSchema<unknown>,
    _options: ExtractOptions = {}
  ): Promise<unknown> {
    try {
      await this.initializeApp()

      const result = await this.app!.extract({
        urls,
        schema,
      })
      
      return result
    } catch (error) {
      logger.error('Firecrawl extract error:', error)
      throw new Error(`Extract failed: ${error}`)
    }
  }

  /**
   * Deep crawl a website with optional webhook support
   * Official docs: https://docs.firecrawl.dev/features/crawl
   */
  async crawl(url: string, options: CrawlOptions = {}): Promise<unknown> {
    try {
      await this.initializeApp()
      const { 
        limit = 100,
        scrapeOptions = {},
        webhook 
      } = options

      const scrapeOpts = {
        formats: (scrapeOptions?.formats || ['markdown']) as FirecrawlFormat[] & string[],
        onlyMainContent: true,
        ...scrapeOptions
      }

      const crawlConfig = {
        limit,
        scrapeOptions: scrapeOpts,
        ...(webhook && { webhook })
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await this.app!.crawl(url, crawlConfig as any)

      return result
    } catch (error) {
      logger.error('Firecrawl crawl error:', error)
      throw new Error(`Crawl failed: ${error}`)
    }
  }

  /**
   * Get crawl status by crawl ID
   * Official docs: https://docs.firecrawl.dev/features/crawl
   */
  async getCrawlStatus(crawlId: string): Promise<unknown> {
    try {
      await this.initializeApp()
      const result = await this.app!.getCrawlStatus(crawlId)
      return result
    } catch (error) {
      logger.error('Firecrawl get crawl status error:', error)
      throw new Error(`Get crawl status failed: ${error}`)
    }
  }

  /**
   * Generate a sitemap for a website
   * Official docs: https://docs.firecrawl.dev/features/map
   */
  async generateMap(url: string, options: { limit?: number } = {}): Promise<unknown> {
    try {
      await this.initializeApp()
      const { limit = 100 } = options

      const result = await this.app!.map(url, {
        limit,
      })

      return result
    } catch (error) {
      logger.error('Firecrawl map error:', error)
      throw new Error(`Map generation failed: ${error}`)
    }
  }
}
