import { NextRequest, NextResponse } from 'next/server'
import { CompetitorAnalyzer } from '@/lib/research/competitor-analyzer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { urls, includeSocialAnalysis, includeContentAnalysis, maxDepth } = body

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'URLs array is required' },
        { status: 400 }
      )
    }

    // Validate URLs
    const validUrls = urls.filter(url => {
      try {
        new URL(url)
        return true
      } catch {
        return false
      }
    })

    if (validUrls.length === 0) {
      return NextResponse.json(
        { error: 'No valid URLs provided' },
        { status: 400 }
      )
    }

    console.log(`🔍 Starting competitor analysis for ${validUrls.length} competitors`)

    const analyzer = new CompetitorAnalyzer()
    
    const result = await analyzer.analyzeCompetitors({
      urls: validUrls,
      includeSocialAnalysis: includeSocialAnalysis || false,
      includeContentAnalysis: includeContentAnalysis || false,
      maxDepth: maxDepth || 2
    })

    return NextResponse.json({
      success: true,
      data: result,
      analyzedCount: validUrls.length,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Competitor analysis error:', error)
    
    return NextResponse.json(
      { 
        error: 'Competitor analysis failed',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
