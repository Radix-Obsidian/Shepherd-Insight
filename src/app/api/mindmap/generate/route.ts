import { NextRequest, NextResponse } from 'next/server'
import { MindMapNode, MindMapEdge, NODE_COLORS } from '@/lib/mindmap/types'
import { GroqClient } from '@/lib/research/groq-client'
import { z } from 'zod'
import { logger } from '@/lib/logger'

interface MindMapRequestBody {
  text?: string
  image?: string
  insights?: unknown
}

// Schema for AI-generated mind map structure
const MindMapSchema = z.object({
  nodes: z.array(z.object({
    id: z.string(),
    type: z.enum(['persona', 'pain', 'feature', 'idea', 'note']),
    label: z.string(),
    description: z.string().optional(),
    position: z.object({
      x: z.number(),
      y: z.number()
    })
  })),
  edges: z.array(z.object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    label: z.string().optional(),
    type: z.enum(['smoothstep', 'straight', 'step']).optional()
  }))
})

export async function POST(request: NextRequest) {
  try {
    const { text, image, insights } = (await request.json()) as MindMapRequestBody

    if (!text && !image && !insights) {
      return NextResponse.json(
        { error: 'Text, image, or insights are required' },
        { status: 400 }
      )
    }

    const groq = new GroqClient()

    let prompt = ''

    if (insights) {
      // Generate mind map from research insights
      prompt = `Convert these product research insights into a mind map structure:

${JSON.stringify(insights, null, 2)}

Create nodes for:
1. Personas (target users) - extract key user segments
2. Pain points (problems to solve) - identify main challenges
3. Features (solutions) - map features that address pain points
4. Ideas (opportunities) - suggest innovative solutions
5. Notes (constraints/risks) - highlight important considerations

Create edges that show relationships between:
- Personas → Pain points (who has what problems)
- Pain points → Features (how features solve problems)
- Features → Ideas (how features enable new opportunities)
- Ideas → Notes (what constraints apply)

Position nodes logically with personas on the left, pain points in the middle, features on the right, and ideas/notes around the edges.

Return a JSON structure with nodes and edges arrays.`
    } else if (text) {
      // Generate mind map from text input
      prompt = `Analyze this text and create a mind map structure:

"${text}"

Extract key concepts and organize them into:
1. Personas (who is involved)
2. Pain points (what problems exist)
3. Features (what solutions are mentioned)
4. Ideas (what opportunities exist)
5. Notes (what constraints or risks are mentioned)

Create logical connections between these elements and position them in a meaningful layout.

Return a JSON structure with nodes and edges arrays.`
    } else if (image) {
      // Generate mind map from image analysis
      prompt = `Analyze this image and create a mind map structure based on what you can see:

[Image analysis would go here - for now, create a generic mind map]

Extract visual elements and convert them into:
1. Personas (who might use what's shown)
2. Pain points (what problems the image suggests)
3. Features (what solutions are visible)
4. Ideas (what opportunities exist)
5. Notes (what constraints are apparent)

Return a JSON structure with nodes and edges arrays.`
    }

    // Generate mind map using Groq AI with automatic model fallback
    const aiResponse = await groq.structuredOutputWithFallback(prompt, MindMapSchema, {
      temperature: 0.3
    })

    // Convert AI response to ReactFlow format
    const nodes: MindMapNode[] = aiResponse.nodes.map(node => ({
      id: node.id,
      type: node.type,
      label: node.label,
      color: NODE_COLORS[node.type],
      position: node.position,
      data: {
        label: node.label,
        type: node.type,
        color: NODE_COLORS[node.type],
        description: node.description
      }
    }))

    const edges: MindMapEdge[] = aiResponse.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      animated: true,
      type: edge.type || 'smoothstep',
      label: edge.label
    }))

    // Add some layout optimization
    const optimizedNodes = optimizeLayout(nodes, edges)

    return NextResponse.json({
      nodes: optimizedNodes,
      edges,
      generatedAt: new Date().toISOString(),
      source: insights ? 'insights' : text ? 'text' : 'image'
    })

  } catch (error: unknown) {
    logger.error('Mind map generation error', error)
    const message =
      error instanceof Error ? error.message : 'Unable to generate mind map'
    
    // Fallback to mock data if AI generation fails
    const fallbackNodes: MindMapNode[] = [
      {
        id: 'node-1',
        type: 'persona',
        label: 'Target User',
        color: NODE_COLORS.persona,
        position: { x: -200, y: -100 },
        data: {
          label: 'Target User',
          type: 'persona',
          color: NODE_COLORS.persona,
        },
      },
      {
        id: 'node-2',
        type: 'pain',
        label: 'Key Problem',
        color: NODE_COLORS.pain,
        position: { x: -100, y: 0 },
        data: {
          label: 'Key Problem',
          type: 'pain',
          color: NODE_COLORS.pain,
        },
      },
      {
        id: 'node-3',
        type: 'feature',
        label: 'Core Solution',
        color: NODE_COLORS.feature,
        position: { x: 100, y: 0 },
        data: {
          label: 'Core Solution',
          type: 'feature',
          color: NODE_COLORS.feature,
        },
      }
    ]

    const fallbackEdges: MindMapEdge[] = [
      {
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
        animated: true,
        type: 'smoothstep',
      },
      {
        id: 'edge-2',
        source: 'node-2',
        target: 'node-3',
        animated: true,
        type: 'smoothstep',
      }
    ]

    return NextResponse.json({
      nodes: fallbackNodes,
      edges: fallbackEdges,
      error: message,
      fallback: true
    })
  }
}

/**
 * Optimize node layout for better visualization
 */
function optimizeLayout(nodes: MindMapNode[], _edges: MindMapEdge[]): MindMapNode[] {
  // Simple layout optimization - spread nodes in a circle
  const centerX = 0
  const centerY = 0
  const radius = 300
  
  return nodes.map((node, index) => {
    const angle = (2 * Math.PI * index) / nodes.length
    const x = centerX + radius * Math.cos(angle)
    const y = centerY + radius * Math.sin(angle)
    
    return {
      ...node,
      position: { x, y }
    }
  })
}
