import { InsightData } from '@/types/insight'
import { MindMapNode, MindMapEdge, NODE_COLORS } from '@/lib/mindmap/types'

export function generateMindMapFromInsight(insight: InsightData): { nodes: MindMapNode[]; edges: MindMapEdge[] } {
  const nodes: MindMapNode[] = []
  const edges: MindMapEdge[] = []
  let nodeIdCounter = 1

  // Helper function to create nodes
  const createNode = (type: MindMapNode['type'], label: string, position: { x: number; y: number }) => {
    const node: MindMapNode = {
      id: `node-${nodeIdCounter++}`,
      type,
      label,
      color: NODE_COLORS[type],
      position,
      data: {
        label,
        type,
        color: NODE_COLORS[type],
      },
    }
    nodes.push(node)
    return node
  }

  // Helper function to create edges
  const createEdge = (source: MindMapNode, target: MindMapNode) => {
    const edge: MindMapEdge = {
      id: `edge-${source.id}-${target.id}`,
      source: source.id,
      target: target.id,
      animated: true,
      type: 'smoothstep',
    }
    edges.push(edge)
    return edge
  }

  // Create central "Product" node
  const centralNode = createNode('idea', 'Product Concept', { x: 0, y: 0 })

  // Create persona nodes
  const personaNodes: MindMapNode[] = []
  insight.personas.forEach((persona, index) => {
    const angle = (index * 2 * Math.PI) / insight.personas.length
    const radius = 200
    const position = {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius - 100,
    }
    const personaNode = createNode('persona', persona.name, position)
    personaNodes.push(personaNode)
    createEdge(centralNode, personaNode)
  })

  // Create pain point nodes
  const painNodes: MindMapNode[] = []
  insight.pain_points.forEach((pain, index) => {
    const angle = (index * 2 * Math.PI) / insight.pain_points.length
    const radius = 300
    const position = {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius - 200,
    }
    const painNode = createNode('pain', pain.description.substring(0, 30) + '...', position)
    painNodes.push(painNode)
    
    // Connect to relevant personas
    pain.sources.forEach((sourceId) => {
      const personaNode = personaNodes.find(p => p.data.label.includes(sourceId))
      if (personaNode) {
        createEdge(personaNode, painNode)
      }
    })
  })

  // Create feature nodes
  const featureNodes: MindMapNode[] = []
  insight.MVP_features.forEach((feature, index) => {
    const angle = (index * 2 * Math.PI) / insight.MVP_features.length
    const radius = 400
    const position = {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius - 300,
    }
    const featureNode = createNode('feature', feature, position)
    featureNodes.push(featureNode)
    
    // Connect to pain points (simplified mapping)
    const painIndex = index % painNodes.length
    if (painNodes[painIndex]) {
      createEdge(painNodes[painIndex], featureNode)
    }
  })

  // Create opportunity nodes
  const opportunityNodes: MindMapNode[] = []
  insight.opportunities.forEach((opportunity, index) => {
    const angle = (index * 2 * Math.PI) / insight.opportunities.length
    const radius = 500
    const position = {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius - 400,
    }
    const opportunityNode = createNode('idea', opportunity.description.substring(0, 30) + '...', position)
    opportunityNodes.push(opportunityNode)
    
    // Connect to features
    const featureIndex = index % featureNodes.length
    if (featureNodes[featureIndex]) {
      createEdge(featureNodes[featureIndex], opportunityNode)
    }
  })

  // Create competitor nodes
  insight.competitors.forEach((competitor, index) => {
    const position = {
      x: -400 + (index * 150),
      y: 200,
    }
    const competitorNode = createNode('note', competitor.name, position)
    
    // Connect to central node
    createEdge(centralNode, competitorNode)
  })

  // Create out-of-scope notes
  insight.out_of_scope.forEach((item, index) => {
    const position = {
      x: 400 + (index * 150),
      y: 200,
    }
    const noteNode = createNode('note', `Not Now: ${item}`, position)
    
    // Connect to central node
    createEdge(centralNode, noteNode)
  })

  return { nodes, edges }
}
