import { NextRequest, NextResponse } from 'next/server'
import { AdvancedGroqClient, PersonaData } from '@/lib/research/ai-analyzer'
import { logger } from '@/lib/logger'

type AnalyzeAction =
  | 'generate-personas'
  | 'market-sizing'
  | 'prioritize-features'
  | 'get-models'
  | 'validate-output'
  | string

interface AnalyzeRequestBody {
  action?: AnalyzeAction
  data?: unknown
  query?: string
  personas?: unknown
  schema?: unknown
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AnalyzeRequestBody
    const { action, data, query, personas, schema } = body

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }

    const aiAnalyzer = new AdvancedGroqClient()

    let result

    switch (action) {
      case 'generate-personas':
        if (!data || !query) {
          return NextResponse.json(
            { error: 'Data and query are required for persona generation' },
            { status: 400 }
          )
        }
        if (Array.isArray(data)) {
          result = await aiAnalyzer.generatePersonas(data as unknown[], query)
        } else {
          return NextResponse.json(
            { error: 'Data must be an array for persona generation' },
            { status: 400 }
          )
        }
        break

      case 'market-sizing':
        if (!data || !query) {
          return NextResponse.json(
            { error: 'Data and query are required for market sizing' },
            { status: 400 }
          )
        }
        if (Array.isArray(data)) {
          result = await aiAnalyzer.performMarketSizing(data as unknown[], query)
        } else {
          return NextResponse.json(
            { error: 'Data must be an array for market sizing' },
            { status: 400 }
          )
        }
        break

      case 'prioritize-features':
        if (!data || !personas) {
          return NextResponse.json(
            { error: 'Data and personas are required for feature prioritization' },
            { status: 400 }
          )
        }
        if (Array.isArray(data)) {
          result = await aiAnalyzer.prioritizeFeatures(data as unknown[], personas as PersonaData[])
        } else {
          return NextResponse.json(
            { error: 'Data must be an array for feature prioritization' },
            { status: 400 }
          )
        }
        break

      case 'get-models':
        result = aiAnalyzer.getAvailableModels()
        break

      case 'validate-output':
        if (!data || !schema) {
          return NextResponse.json(
            { error: 'Data and schema are required for validation' },
            { status: 400 }
          )
        }
        // Note: In a real implementation, you'd need to reconstruct the schema from the request
        result = { error: 'Schema validation not implemented in this example' }
        break

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      action,
      data: result,
      timestamp: new Date().toISOString()
    })

  } catch (error: unknown) {
    logger.error('AI analysis error', error)
    const details = error instanceof Error ? error.message : 'Unknown error'

    return NextResponse.json(
      {
        error: 'AI analysis failed',
        details
      },
      { status: 500 }
    )
  }
}
