/**
 * Deep Competitor Analysis using Firecrawl
 * Analyzes competitor websites for pricing, features, and weaknesses
 */

import { FirecrawlClient } from './firecrawl-client'
import { GroqClient } from './groq-client'
import { z } from 'zod'

// Zod schema for competitor analysis
const CompetitorAnalysisSchema = z.object({
  company_name: z.string(),
  website_url: z.string(),
  pricing_model: z.object({
    type: z.enum(['freemium', 'subscription', 'one-time', 'usage-based', 'enterprise']),
    starting_price: z.string().optional(),
    pricing_tiers: z.array(z.object({
      name: z.string(),
      price: z.string(),
      features: z.array(z.string())
    })).optional(),
    free_trial: z.boolean().optional(),
    enterprise_contact: z.boolean().optional()
  }),
  key_features: z.array(z.string()),
  unique_selling_points: z.array(z.string()),
  weaknesses: z.array(z.string()),
  target_audience: z.array(z.string()),
  market_position: z.enum(['leader', 'challenger', 'follower', 'niche']),
  strengths: z.array(z.string()),
  competitive_advantages: z.array(z.string()),
  content_strategy: z.object({
    blog_frequency: z.string().optional(),
    content_types: z.array(z.string()).optional(),
    seo_focus: z.array(z.string()).optional()
  }).optional(),
  social_presence: z.object({
    platforms: z.array(z.string()).optional(),
    follower_count: z.string().optional(),
    engagement_level: z.enum(['high', 'medium', 'low']).optional()
  }).optional()
})

export interface CompetitorAnalysisOptions {
  urls: string[]
  includeSocialAnalysis?: boolean
  includeContentAnalysis?: boolean
  maxDepth?: number
}

export interface CompetitorAnalysisResult {
  competitors: z.infer<typeof CompetitorAnalysisSchema>[]
  market_insights: {
    pricing_trends: string[]
    feature_gaps: string[]
    market_opportunities: string[]
    competitive_threats: string[]
  }
  recommendations: {
    pricing_strategy: string[]
    feature_priorities: string[]
    positioning_suggestions: string[]
    differentiation_opportunities: string[]
  }
}

export class CompetitorAnalyzer {
  private firecrawl: FirecrawlClient
  private groq: GroqClient

  constructor() {
    this.firecrawl = new FirecrawlClient()
    this.groq = new GroqClient()
  }

  /**
   * Analyze multiple competitors
   */
  async analyzeCompetitors(options: CompetitorAnalysisOptions): Promise<CompetitorAnalysisResult> {
    const { urls, includeSocialAnalysis = false, includeContentAnalysis = false, maxDepth = 2 } = options

    console.log(`🔍 Starting competitor analysis for ${urls.length} competitors...`)

    // Step 1: Scrape competitor websites
    const competitorData = await this.scrapeCompetitorWebsites(urls, maxDepth)

    // Step 2: Extract structured data
    const structuredData = await this.extractStructuredData(competitorData, includeContentAnalysis)

    // Step 3: Analyze with AI
    const analysis = await this.performAIAnalysis(structuredData, includeSocialAnalysis)

    // Step 4: Generate insights and recommendations
    const insights = await this.generateInsights(analysis)

    console.log('✅ Competitor analysis completed')

    return {
      competitors: analysis,
      market_insights: insights.market_insights,
      recommendations: insights.recommendations
    }
  }

  /**
   * Scrape competitor websites
   */
  private async scrapeCompetitorWebsites(urls: string[], maxDepth: number) {
    console.log('📄 Scraping competitor websites...')
    
    const results = []
    
    for (const url of urls) {
      try {
        // Scrape main page
        const mainPage = await this.firecrawl.scrapeUrl(url, {
          formats: ['markdown', 'html'],
          onlyMainContent: true
        })

        // Scrape pricing page if exists
        let pricingPage = null
        try {
          const pricingUrl = this.findPricingPage(url, mainPage)
          if (pricingUrl) {
            pricingPage = await this.firecrawl.scrapeUrl(pricingUrl, {
              formats: ['markdown'],
              onlyMainContent: true
            })
          }
        } catch (error) {
          console.warn(`Could not scrape pricing page for ${url}:`, error)
        }

        // Scrape about/features page
        let featuresPage = null
        try {
          const featuresUrl = this.findFeaturesPage(url, mainPage)
          if (featuresUrl) {
            featuresPage = await this.firecrawl.scrapeUrl(featuresUrl, {
              formats: ['markdown'],
              onlyMainContent: true
            })
          }
        } catch (error) {
          console.warn(`Could not scrape features page for ${url}:`, error)
        }

        results.push({
          url,
          mainPage,
          pricingPage,
          featuresPage,
          scrapedAt: new Date().toISOString()
        })

        console.log(`✅ Scraped ${url}`)
      } catch (error) {
        console.error(`❌ Failed to scrape ${url}:`, error)
        results.push({
          url,
          error: error instanceof Error ? error.message : String(error),
          scrapedAt: new Date().toISOString()
        })
      }
    }

    return results
  }

  /**
   * Extract structured data using AI
   */
  private async extractStructuredData(scrapedData: any[], includeContentAnalysis: boolean) {
    console.log('🤖 Extracting structured data with AI...')

    const structuredResults = []

    for (const data of scrapedData) {
      if (data.error) {
        structuredResults.push({
          url: data.url,
          error: data.error
        })
        continue
      }

      try {
        const prompt = this.buildExtractionPrompt(data, includeContentAnalysis)
        
        const analysis = await this.groq.structuredOutputWithFallback(
          prompt,
          CompetitorAnalysisSchema
        )

        structuredResults.push({
          url: data.url,
          analysis,
          extractedAt: new Date().toISOString()
        })

        console.log(`✅ Extracted data for ${data.url}`)
      } catch (error) {
        console.error(`❌ Failed to extract data for ${data.url}:`, error)
        structuredResults.push({
          url: data.url,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }

    return structuredResults
  }

  /**
   * Build extraction prompt for AI
   */
  private buildExtractionPrompt(data: any, includeContentAnalysis: boolean): string {
    const { url, mainPage, pricingPage, featuresPage } = data

    let prompt = `Analyze this competitor website and extract structured information:

Website URL: ${url}

Main Page Content:
${mainPage?.markdown || mainPage?.content || 'No content available'}

`

    if (pricingPage) {
      prompt += `Pricing Page Content:
${pricingPage.markdown || pricingPage.content || 'No pricing content available'}

`
    }

    if (featuresPage) {
      prompt += `Features Page Content:
${featuresPage.markdown || featuresPage.content || 'No features content available'}

`
    }

    prompt += `Please extract the following information:
1. Company name and basic info
2. Pricing model and tiers
3. Key features and capabilities
4. Unique selling points
5. Target audience
6. Market position
7. Strengths and weaknesses
8. Competitive advantages

${includeContentAnalysis ? `
Also analyze:
9. Content strategy and SEO focus
10. Social media presence and engagement
` : ''}

Provide a comprehensive analysis that can be used for competitive intelligence.`

    return prompt
  }

  /**
   * Perform AI analysis on structured data
   */
  private async performAIAnalysis(structuredData: any[], includeSocialAnalysis: boolean) {
    console.log('🧠 Performing AI analysis...')

    const validData = structuredData.filter(d => !d.error)
    
    if (validData.length === 0) {
      throw new Error('No valid competitor data to analyze')
    }

    const prompt = `Analyze these competitor data points and provide insights:

${validData.map(d => `
Company: ${d.analysis?.company_name || 'Unknown'}
URL: ${d.url}
Pricing: ${JSON.stringify(d.analysis?.pricing_model || {})}
Features: ${d.analysis?.key_features?.join(', ') || 'Unknown'}
Strengths: ${d.analysis?.strengths?.join(', ') || 'Unknown'}
Weaknesses: ${d.analysis?.weaknesses?.join(', ') || 'Unknown'}
`).join('\n')}

Provide insights on:
1. Market trends and patterns
2. Pricing strategies
3. Feature gaps and opportunities
4. Competitive positioning
5. Market opportunities

${includeSocialAnalysis ? `
Also analyze:
6. Content and social media strategies
7. Brand positioning and messaging
` : ''}

Return the analysis in the same structured format.`

    const analysis = await this.groq.structuredOutputWithFallback(
      prompt,
      z.array(CompetitorAnalysisSchema)
    )

    return analysis
  }

  /**
   * Generate market insights and recommendations
   */
  private async generateInsights(analysis: any[]) {
    console.log('💡 Generating insights and recommendations...')

    const prompt = `Based on this competitor analysis, provide strategic insights:

${analysis.map(a => `
- ${a.company_name}: ${a.market_position} player
- Pricing: ${a.pricing_model?.type}
- Key features: ${a.key_features?.slice(0, 3).join(', ')}
- Strengths: ${a.strengths?.slice(0, 2).join(', ')}
- Weaknesses: ${a.weaknesses?.slice(0, 2).join(', ')}
`).join('\n')}

Provide:
1. Market insights (trends, gaps, opportunities)
2. Pricing strategy recommendations
3. Feature prioritization suggestions
4. Positioning and differentiation opportunities

Format as JSON with market_insights and recommendations objects.`

    const insights = await this.groq.structuredOutput(
      prompt,
      z.object({
        market_insights: z.object({
          pricing_trends: z.array(z.string()),
          feature_gaps: z.array(z.string()),
          market_opportunities: z.array(z.string()),
          competitive_threats: z.array(z.string())
        }),
        recommendations: z.object({
          pricing_strategy: z.array(z.string()),
          feature_priorities: z.array(z.string()),
          positioning_suggestions: z.array(z.string()),
          differentiation_opportunities: z.array(z.string())
        })
      })
    )

    return insights
  }

  /**
   * Find pricing page URL
   */
  private findPricingPage(baseUrl: string, mainPage: any): string | null {
    const content = mainPage?.markdown || mainPage?.content || ''
    const pricingKeywords = ['pricing', 'plans', 'cost', 'price', 'subscription']
    
    // Look for pricing links in content
    const pricingLinks = content.match(/\[([^\]]*pricing[^\]]*)\]\(([^)]+)\)/gi)
    if (pricingLinks) {
      const link = pricingLinks[0].match(/\(([^)]+)\)/)?.[1]
      if (link) {
        return link.startsWith('http') ? link : new URL(link, baseUrl).href
      }
    }

    // Try common pricing page paths
    const commonPaths = ['/pricing', '/plans', '/cost', '/price']
    for (const path of commonPaths) {
      try {
        return new URL(path, baseUrl).href
      } catch {
        continue
      }
    }

    return null
  }

  /**
   * Find features page URL
   */
  private findFeaturesPage(baseUrl: string, mainPage: any): string | null {
    const content = mainPage?.markdown || mainPage?.content || ''
    const featureKeywords = ['features', 'capabilities', 'what-we-do', 'solutions']
    
    // Look for features links in content
    const featureLinks = content.match(/\[([^\]]*features[^\]]*)\]\(([^)]+)\)/gi)
    if (featureLinks) {
      const link = featureLinks[0].match(/\(([^)]+)\)/)?.[1]
      if (link) {
        return link.startsWith('http') ? link : new URL(link, baseUrl).href
      }
    }

    // Try common features page paths
    const commonPaths = ['/features', '/capabilities', '/solutions', '/what-we-do']
    for (const path of commonPaths) {
      try {
        return new URL(path, baseUrl).href
      } catch {
        continue
      }
    }

    return null
  }
}
