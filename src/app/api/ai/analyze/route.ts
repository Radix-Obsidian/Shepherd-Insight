import { NextRequest, NextResponse } from 'next/server'
import { AdvancedGroqClient } from '@/lib/research/ai-analyzer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data, query, personas } = body

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
        result = await aiAnalyzer.generatePersonas(data, query)
        break

      case 'market-sizing':
        if (!data || !query) {
          return NextResponse.json(
            { error: 'Data and query are required for market sizing' },
            { status: 400 }
          )
        }
        result = await aiAnalyzer.performMarketSizing(data, query)
        break

      case 'prioritize-features':
        if (!data || !personas) {
          return NextResponse.json(
            { error: 'Data and personas are required for feature prioritization' },
            { status: 400 }
          )
        }
        result = await aiAnalyzer.prioritizeFeatures(data, personas)
        break

      case 'get-models':
        result = aiAnalyzer.getAvailableModels()
        break

      case 'validate-output':
        if (!data || !body.schema) {
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

  } catch (error: any) {
    console.error('AI analysis error:', error)
    
    return NextResponse.json(
      { 
        error: 'AI analysis failed',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
