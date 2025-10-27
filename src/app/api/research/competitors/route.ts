import { NextRequest, NextResponse } from 'next/server'
import { CompetitorAnalyzer } from '@/lib/research/competitor-analyzer'
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    if (typeof payload !== 'object' || payload === null) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    const { urls, includeSocialAnalysis, includeContentAnalysis, maxDepth } = payload as Record<string, unknown>

    if (!Array.isArray(urls) || urls.length === 0) {
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

    logger.debug(`🔍 Starting competitor analysis for ${validUrls.length} competitors`)

    const analyzer = new CompetitorAnalyzer()

    const result = await analyzer.analyzeCompetitors({
      urls: validUrls,
      includeSocialAnalysis: Boolean(includeSocialAnalysis),
      includeContentAnalysis: Boolean(includeContentAnalysis),
      maxDepth: typeof maxDepth === 'number' ? maxDepth : 2,
    })

    return NextResponse.json({
      success: true,
      data: result,
      analyzedCount: validUrls.length,
      timestamp: new Date().toISOString()
    })

  } catch (error: unknown) {
    logger.error('Competitor analysis error:', error)
    const message = error instanceof Error ? error.message : 'Competitor analysis failed'

    return NextResponse.json(
      {
        error: 'Competitor analysis failed',
        details: message,
      },
      { status: 500 }
    )
  }
}
