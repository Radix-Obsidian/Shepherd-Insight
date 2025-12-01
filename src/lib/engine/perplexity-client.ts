/**
 * Perplexity AI Client
 * Real-time web research with citations
 * @see https://docs.perplexity.ai
 */

export interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface PerplexityResearchOptions {
  query: string
  model?: 'sonar-deep-research' | 'sonar-pro' | 'sonar-reasoning-pro' | 'sonar'
  systemPrompt?: string
  searchDomainFilter?: string[]  // Trusted sources for research
  searchRecency?: 'month' | 'week' | 'day'
  searchAcademic?: boolean
  reasoningEffort?: 'low' | 'medium' | 'high'
  temperature?: number
  maxTokens?: number
}

export interface PerplexityResponse {
  id: string
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  citations?: string[]
}

export interface PerplexityStreamChunk {
  type: 'reasoning' | 'content' | 'done'
  content?: string
  thought?: string
  citations?: string[]
}

/**
 * Main research function using Perplexity Sonar
 */
export async function researchWithPerplexity(
  options: PerplexityResearchOptions
): Promise<PerplexityResponse> {
  const apiKey = process.env.PERPLEXITY_API_KEY
  
  if (!apiKey) {
    throw new Error('PERPLEXITY_API_KEY not found in environment variables')
  }

  const messages: PerplexityMessage[] = []
  
  if (options.systemPrompt) {
    messages.push({
      role: 'system',
      content: options.systemPrompt
    })
  }
  
  messages.push({
    role: 'user',
    content: options.query
  })

  const body: any = {
    model: options.model || 'sonar-deep-research',
    messages,
    temperature: options.temperature ?? 0.2,
    max_tokens: options.maxTokens,
    return_citations: true,
  }

  // Add search filters if provided
  if (options.searchDomainFilter && options.searchDomainFilter.length > 0) {
    body.search_domain_filter = options.searchDomainFilter
  }

  if (options.searchRecency) {
    body.search_recency_filter = options.searchRecency
  }

  if (options.searchAcademic) {
    body.search_academic = true
  }

  if (options.reasoningEffort) {
    body.reasoning_effort = options.reasoningEffort
  }

  // Create AbortController for timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 90000) // 90 second timeout

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Perplexity API error (${response.status}): ${error}`)
    }

    return await response.json()
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Perplexity request timed out after 90 seconds. Try using a faster model like sonar-pro.')
    }
    throw error
  }
}

/**
 * Streaming research with real-time reasoning steps
 */
export async function* streamResearchWithPerplexity(
  options: PerplexityResearchOptions
): AsyncGenerator<PerplexityStreamChunk> {
  const apiKey = process.env.PERPLEXITY_API_KEY
  
  if (!apiKey) {
    throw new Error('PERPLEXITY_API_KEY not found in environment variables')
  }

  const messages: PerplexityMessage[] = []
  
  if (options.systemPrompt) {
    messages.push({
      role: 'system',
      content: options.systemPrompt
    })
  }
  
  messages.push({
    role: 'user',
    content: options.query
  })

  const body: any = {
    model: options.model || 'sonar-deep-research',
    messages,
    temperature: options.temperature ?? 0.2,
    max_tokens: options.maxTokens,
    return_citations: true,
    stream: true,
  }

  if (options.searchDomainFilter && options.searchDomainFilter.length > 0) {
    body.search_domain_filter = options.searchDomainFilter
  }

  if (options.searchRecency) {
    body.search_recency_filter = options.searchRecency
  }

  if (options.searchAcademic) {
    body.search_academic = true
  }

  if (options.reasoningEffort) {
    body.reasoning_effort = options.reasoningEffort
  }

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Perplexity API error (${response.status}): ${error}`)
  }

  // Parse Server-Sent Events stream
  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('No response body')
  }

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        
        if (data === '[DONE]') {
          yield { type: 'done' }
          return
        }

        try {
          const parsed = JSON.parse(data)
          
          // Handle reasoning steps (Sonar Deep Research)
          if (parsed.reasoning_steps) {
            for (const step of parsed.reasoning_steps) {
              yield {
                type: 'reasoning',
                thought: step.thought,
                citations: step.web_search?.search_results?.map((r: any) => r.url)
              }
            }
          }

          // Handle content chunks
          if (parsed.choices?.[0]?.delta?.content) {
            yield {
              type: 'content',
              content: parsed.choices[0].delta.content
            }
          }
        } catch (e) {
          // Skip malformed chunks
          continue
        }
      }
    }
  }
}

/**
 * Competitor research workflow
 */
export async function researchCompetitors(urls: string[]) {
  return await researchWithPerplexity({
    query: `Analyze these competitors: ${urls.join(', ')}
    
For each competitor:
1. Core value proposition
2. Target audience demographics
3. Key features and differentiators
4. Pricing model and tiers
5. User pain points they solve
6. Weaknesses or gaps in their solution

Then synthesize:
- Competitive landscape overview
- Opportunities for differentiation
- Market gaps to exploit
- User needs not being met

Provide specific, actionable insights with citations.`,
    model: 'sonar-pro',
    searchDomainFilter: urls.length > 0 ? urls : undefined,
    reasoningEffort: 'high',
    searchRecency: 'month'
  })
}

/**
 * Market research workflow
 */
export async function researchMarket(problemSpace: string, targetAudience: string) {
  return await researchWithPerplexity({
    query: `Research the market for: ${problemSpace}
    
Target audience: ${targetAudience}

Provide:
1. Market size and growth trends (cite recent reports)
2. Key user personas in this space
3. Common pain points from user forums, Reddit, reviews
4. Existing solutions and their limitations
5. Emerging trends and opportunities
6. User behavior patterns

Focus on data from the last 3 months. Include citations for all statistics.`,
    model: 'sonar-pro', // Changed from sonar-deep-research for faster results
    reasoningEffort: 'medium', // Changed from high for faster results
    searchRecency: 'month'
  })
}

/**
 * Validation research workflow
 */
export async function researchProblemValidation(problemStatement: string) {
  return await researchWithPerplexity({
    query: `Validate this problem space: "${problemStatement}"
    
Research:
1. Evidence this problem exists (user complaints, forum discussions, Reddit threads)
2. Size of the affected audience
3. Current workarounds people use
4. Willingness to pay for solutions (pricing research, competitor pricing)
5. Failed solutions and why they failed

Provide evidence-based validation with specific examples and citations.`,
    model: 'sonar-pro',
    reasoningEffort: 'medium',
    searchRecency: 'month'
  })
}

/**
 * Health check for Perplexity API
 */
export async function healthCheckPerplexity(): Promise<boolean> {
  try {
    const response = await researchWithPerplexity({
      query: 'What is 2+2?',
      model: 'sonar',
      maxTokens: 50
    })
    return !!response.choices?.[0]?.message?.content
  } catch (error) {
    console.error('Perplexity health check failed:', error)
    return false
  }
}
