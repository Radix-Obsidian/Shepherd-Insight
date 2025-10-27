'use server';

import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { FirecrawlClient } from '@/lib/research/firecrawl-client';
import { GroqClient } from '@/lib/research/groq-client';

const firecrawl = new FirecrawlClient();
const groq = new GroqClient({ temperature: 0.25 });

type SourceSnippet = {
  url: string;
  title: string;
  snippet: string;
};

const CompetitorAnalysisSchema = z.object({
  competitors: z
    .array(
      z.object({
        name: z.string(),
        url: z.string().optional(),
        description: z.string(),
        features: z.array(z.string()).optional(),
        pricing: z.string().optional(),
        strengths: z.string(),
        weaknesses: z.string(),
        targetAudience: z.string().optional(),
      })
    )
    .min(1),
  marketInsights: z.object({
    totalMarketSize: z.string().optional(),
    growthRate: z.string().optional(),
    keyTrends: z.array(z.string()).min(1),
    opportunityGaps: z.array(z.string()).min(1),
  }),
  recommendations: z.array(z.string()).min(1),
});

const MarketResearchSchema = z.object({
  marketOverview: z.object({
    size: z.string().optional(),
    growth: z.string().optional(),
    segments: z.array(z.string()).optional(),
  }),
  trends: z
    .array(
      z.object({
        trend: z.string(),
        impact: z.string(),
        description: z.string(),
      })
    )
    .min(1),
  customerPainPoints: z.array(z.string()).min(1),
  opportunities: z.array(z.string()).min(1),
  recommendedAngles: z.array(z.string()).min(1),
});

const FeatureBenchmarkSchema = z.object({
  feature: z.string(),
  competitors: z
    .array(
      z.object({
        name: z.string(),
        url: z.string().optional(),
        hasFeature: z.string(),
        implementation: z.string(),
        pricing: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .min(1),
  marketAdoption: z.string(),
  differentiationOpportunity: z.string(),
  recommendedPositioning: z.array(z.string()).min(1),
});

async function fetchSearchSnippets(query?: string, limit = 5): Promise<SourceSnippet[]> {
  if (!query) return [];
  try {
    const result = (await firecrawl.search(query, { limit })) as any;
    const items = Array.isArray(result?.data) ? result.data : [];
    const snippets: SourceSnippet[] = [];
    for (const item of items) {
      const url = String(item?.url ?? item?.link ?? '').trim();
      if (!url) continue;
      const title = String(item?.title ?? item?.source ?? url).trim();
      const description =
        String(item?.description ?? item?.snippet ?? item?.content ?? '')
          .replace(/\s+/g, ' ')
          .trim();
      snippets.push({
        url,
        title,
        snippet: description.slice(0, 800),
      });
    }
    return snippets;
  } catch (error) {
    logger.error('Firecrawl search error:', error);
    return [];
  }
}

async function fetchCompetitorSnippets(urls: string[]): Promise<SourceSnippet[]> {
  const unique = Array.from(new Set(urls.filter(Boolean)));
  const results = await Promise.all(
    unique.map(async url => {
      try {
        const scraped = (await firecrawl.scrapeUrl(url, {
          formats: ['markdown'],
          onlyMainContent: true,
        })) as any;
        const data = scraped?.data ?? {};
        const content: string =
          typeof data?.content === 'string'
            ? data.content
            : typeof data?.markdown === 'string'
            ? data.markdown
            : Array.isArray(data?.content)
            ? data.content.join('\n')
            : '';
        if (!content) return null;
        const cleaned = content.replace(/\s+/g, ' ').trim();
        return {
          url,
          title: String(data?.title ?? url).trim(),
          snippet: cleaned.slice(0, 1200),
        };
      } catch (error) {
        logger.warn(`Failed to scrape ${url}:`, error);
        return null;
      }
    })
  );
  return results.filter((item): item is SourceSnippet => Boolean(item));
}

function dedupeSources(sources: SourceSnippet[]) {
  const seen = new Set<string>();
  return sources.filter(source => {
    const key = source.url || source.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildResearchDigest(label: string, sources: SourceSnippet[]) {
  if (!sources.length) return `${label}:\n- No data collected`;
  return `${label}:\n${sources
    .map(
      (src, index) =>
        `Source ${index + 1} — ${src.title}\nURL: ${src.url}\nSummary: ${src.snippet}`
    )
    .join('\n\n')}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, query, competitors = [], marketSegment, feature } = body ?? {};

    if (!action) {
      return NextResponse.json({ error: 'action is required' }, { status: 400 });
    }

    switch (action) {
      case 'competitor-analysis': {
        if (!query && (!competitors || competitors.length === 0)) {
          return NextResponse.json(
            { error: 'Provide a query or a list of competitor URLs.' },
            { status: 400 }
          );
        }

        const searchSnippets = await fetchSearchSnippets(query, 6);
        const scrapedSnippets = await fetchCompetitorSnippets(competitors);
        const sources = dedupeSources([...scrapedSnippets, ...searchSnippets]);

        if (!sources.length) {
          return NextResponse.json(
            { error: 'Unable to retrieve competitor data from Firecrawl.' },
            { status: 502 }
          );
        }

        const prompt = `
You are a competitive intelligence analyst. Using the research snippets provided, produce a structured competitor report that adheres to the target schema.

Business Objective:
- Query: ${query ?? 'N/A'}
- Competitors supplied: ${competitors?.join(', ') || 'None'}

Research Packets:
${buildResearchDigest('Competitor Sources', sources)}

Guidelines:
- Base every statement on the research content above.
- If a detail is unknown, state "Unknown" instead of inventing data.
- Highlight differentiation opportunities for a new entrant.
`;

        const competitorData = await groq.structuredOutputWithFallback(
          prompt,
          CompetitorAnalysisSchema,
          { temperature: 0.25 }
        );

        return NextResponse.json({
          competitorData,
          sources,
          scrapedAt: new Date().toISOString(),
        });
      }

      case 'market-research': {
        const researchQuery = marketSegment || query;
        if (!researchQuery) {
          return NextResponse.json(
            { error: 'Provide a marketSegment or query for market research.' },
            { status: 400 }
          );
        }

        const searchSnippets = await fetchSearchSnippets(
          `${researchQuery} market size trends`,
          6
        );
        if (!searchSnippets.length) {
          return NextResponse.json(
            { error: 'Unable to retrieve market research data from Firecrawl.' },
            { status: 502 }
          );
        }

        const prompt = `
You are a market analyst. Summarize the market landscape using the research snippets below. Produce JSON matching the schema.

Target Market: ${researchQuery}

Research Snippets:
${buildResearchDigest('Market References', searchSnippets)}

Guidelines:
- Infer directionally accurate numbers when exact figures are not available; label them as estimates.
- Surface emerging trends, pain points, and whitespace opportunities grounded in the snippets.
- Provide actionable recommendations for positioning.
`;

        const marketResearch = await groq.structuredOutputWithFallback(
          prompt,
          MarketResearchSchema,
          { temperature: 0.2 }
        );

        return NextResponse.json({
          marketResearch,
          sources: searchSnippets,
          researchedAt: new Date().toISOString(),
        });
      }

      case 'feature-benchmark': {
        const benchmarkQuery = feature || query;
        if (!benchmarkQuery) {
          return NextResponse.json(
            { error: 'Provide a feature to benchmark via "feature" or "query".' },
            { status: 400 }
          );
        }

        const competitorQueries = [
          `${benchmarkQuery} software competitors`,
          ...(Array.isArray(competitors)
            ? competitors.map((url: string) => `${url} ${benchmarkQuery}`)
            : []),
        ];

        const searchSnippets = (
          await Promise.all(competitorQueries.map(q => fetchSearchSnippets(q, 3)))
        ).flat();

        const scrapedSnippets = await fetchCompetitorSnippets(
          Array.isArray(competitors) ? competitors : []
        );
        const sources = dedupeSources([...searchSnippets, ...scrapedSnippets]);

        if (!sources.length) {
          return NextResponse.json(
            { error: 'Unable to retrieve benchmark data from Firecrawl.' },
            { status: 502 }
          );
        }

        const prompt = `
You are a product strategist. Benchmark the feature "${benchmarkQuery}" across the researched competitors.

Research Packets:
${buildResearchDigest('Feature Research', sources)}

Instructions:
- Identify whether each competitor offers the feature (answer "Yes", "No", or "Partial" in hasFeature).
- Describe how the feature is implemented and priced, if mentioned.
- Highlight differentiation opportunities grounded in what competitors do or fail to do.
- Provide concrete positioning angles for a new entrant.
`;

        const benchmark = await groq.structuredOutputWithFallback(
          prompt,
          FeatureBenchmarkSchema,
          { temperature: 0.25 }
        );

        return NextResponse.json({
          benchmark,
          sources,
          analyzedAt: new Date().toISOString(),
        });
      }

      default:
        return NextResponse.json(
          {
            error:
              'Invalid action. Supported actions: competitor-analysis, market-research, feature-benchmark',
          },
          { status: 400 }
        );
    }
  } catch (error: any) {
    logger.error('Firecrawl route error:', error);
    return NextResponse.json(
      {
        error: 'Firecrawl processing failed',
        details: error?.message ?? 'Unknown error',
      },
      { status: 500 }
    );
  }
}
