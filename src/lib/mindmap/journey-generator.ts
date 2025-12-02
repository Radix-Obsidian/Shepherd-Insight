/**
 * Journey-to-MindMap Generator
 * 
 * Steve Jobs: "Start with the customer experience and work backwards to the technology."
 * 
 * This doesn't use AI to "interpret" - it directly visualizes what the user
 * already created in their Shepherd Journey (Compass → Muse → Blueprint → Vault).
 * 
 * The user DID the work. This shows them what they built.
 */

import { MindMapNode, MindMapEdge, NODE_COLORS } from './types'

interface JourneyData {
  clarity?: {
    problemStatement?: string
    targetUser?: string
    jobsToBeDone?: string[]
    opportunityGap?: string
    valueHypotheses?: string[]
    nextSteps?: string[]
  }
  research?: {
    personas?: Array<{
      name: string
      role?: string
      description?: string
      painPoints?: string[]
      goals?: string[]
    }>
    painMap?: Array<{
      pain: string
      severity?: string
      frequency?: string
    }>
    insights?: string[]
  }
  blueprint?: {
    features?: Array<{
      name: string
      description?: string
      priority?: string
      category?: string
    }>
    mvpScope?: string[]
    constraints?: string[]
  }
}

interface GeneratedMindMap {
  nodes: MindMapNode[]
  edges: MindMapEdge[]
}

/**
 * Generate a mind map directly from journey data
 * No AI calls - just smart visualization of structured data
 */
export function generateMindMapFromJourney(
  projectName: string,
  journeyData: JourneyData
): GeneratedMindMap {
  const nodes: MindMapNode[] = []
  const edges: MindMapEdge[] = []
  
  let nodeId = 0
  const createId = () => `journey-node-${++nodeId}`
  
  // Layout configuration
  const VERTICAL_SPACING = 120
  const HORIZONTAL_SPACING = 280
  const CENTER_X = 0
  const CENTER_Y = 0
  
  // ========================================
  // CENTRAL NODE: The Product/Problem
  // ========================================
  const centralNodeId = createId()
  const problemText = journeyData.clarity?.problemStatement 
    ? truncate(journeyData.clarity.problemStatement, 50)
    : projectName
  
  nodes.push({
    id: centralNodeId,
    type: 'idea',
    label: problemText,
    color: NODE_COLORS.idea,
    position: { x: CENTER_X, y: CENTER_Y },
    data: {
      label: problemText,
      type: 'idea',
      color: NODE_COLORS.idea,
    }
  })
  
  // ========================================
  // LEFT SIDE: Target User & Personas
  // ========================================
  const personaX = CENTER_X - HORIZONTAL_SPACING * 1.5
  
  // Target User from Clarity
  if (journeyData.clarity?.targetUser) {
    const targetUserId = createId()
    nodes.push({
      id: targetUserId,
      type: 'persona',
      label: truncate(journeyData.clarity.targetUser, 40),
      color: NODE_COLORS.persona,
      position: { x: personaX, y: CENTER_Y - VERTICAL_SPACING },
      data: {
        label: journeyData.clarity.targetUser,
        type: 'persona',
        color: NODE_COLORS.persona,
      }
    })
    edges.push({
      id: `edge-${centralNodeId}-${targetUserId}`,
      source: centralNodeId,
      target: targetUserId,
      animated: true,
      type: 'smoothstep'
    })
  }
  
  // Personas from Research
  if (journeyData.research?.personas?.length) {
    journeyData.research.personas.slice(0, 3).forEach((persona, idx) => {
      const personaId = createId()
      const yOffset = CENTER_Y + (idx * VERTICAL_SPACING)
      
      nodes.push({
        id: personaId,
        type: 'persona',
        label: persona.name,
        color: NODE_COLORS.persona,
        position: { x: personaX, y: yOffset },
        data: {
          label: persona.name,
          type: 'persona',
          color: NODE_COLORS.persona,
        }
      })
      
      edges.push({
        id: `edge-${centralNodeId}-${personaId}`,
        source: centralNodeId,
        target: personaId,
        animated: true,
        type: 'smoothstep'
      })
      
      // Connect persona to their pain points
      if (persona.painPoints?.length) {
        const painId = createId()
        const painText = truncate(persona.painPoints[0], 35)
        
        nodes.push({
          id: painId,
          type: 'pain',
          label: painText,
          color: NODE_COLORS.pain,
          position: { x: personaX + HORIZONTAL_SPACING * 0.7, y: yOffset },
          data: {
            label: persona.painPoints[0],
            type: 'pain',
            color: NODE_COLORS.pain,
          }
        })
        
        edges.push({
          id: `edge-${personaId}-${painId}`,
          source: personaId,
          target: painId,
          animated: true,
          type: 'smoothstep'
        })
      }
    })
  }
  
  // ========================================
  // CENTER-LEFT: Pain Points from Research
  // ========================================
  if (journeyData.research?.painMap?.length) {
    const painX = CENTER_X - HORIZONTAL_SPACING * 0.5
    const startY = CENTER_Y - VERTICAL_SPACING
    
    journeyData.research.painMap.slice(0, 4).forEach((pain, idx) => {
      const painId = createId()
      const yPos = startY + (idx * VERTICAL_SPACING * 0.8)
      
      nodes.push({
        id: painId,
        type: 'pain',
        label: truncate(pain.pain, 35),
        color: NODE_COLORS.pain,
        position: { x: painX, y: yPos },
        data: {
          label: pain.pain,
          type: 'pain',
          color: NODE_COLORS.pain,
        }
      })
      
      edges.push({
        id: `edge-${centralNodeId}-${painId}`,
        source: centralNodeId,
        target: painId,
        animated: true,
        type: 'smoothstep'
      })
    })
  }
  
  // ========================================
  // RIGHT SIDE: Features from Blueprint
  // ========================================
  if (journeyData.blueprint?.features?.length) {
    const featureX = CENTER_X + HORIZONTAL_SPACING
    const startY = CENTER_Y - ((journeyData.blueprint.features.length - 1) * VERTICAL_SPACING * 0.5) / 2
    
    journeyData.blueprint.features.slice(0, 5).forEach((feature, idx) => {
      const featureId = createId()
      const yPos = startY + (idx * VERTICAL_SPACING * 0.8)
      
      nodes.push({
        id: featureId,
        type: 'feature',
        label: truncate(feature.name, 30),
        color: NODE_COLORS.feature,
        position: { x: featureX, y: yPos },
        data: {
          label: feature.name,
          type: 'feature',
          color: NODE_COLORS.feature,
        }
      })
      
      edges.push({
        id: `edge-${centralNodeId}-${featureId}`,
        source: centralNodeId,
        target: featureId,
        animated: true,
        type: 'smoothstep'
      })
    })
  }
  
  // ========================================
  // BOTTOM: Value Hypotheses / Next Steps
  // ========================================
  if (journeyData.clarity?.valueHypotheses?.length) {
    const noteX = CENTER_X + HORIZONTAL_SPACING * 0.3
    const noteY = CENTER_Y + VERTICAL_SPACING * 2
    
    journeyData.clarity.valueHypotheses.slice(0, 2).forEach((hypothesis, idx) => {
      const noteId = createId()
      
      nodes.push({
        id: noteId,
        type: 'note',
        label: truncate(hypothesis, 40),
        color: NODE_COLORS.note,
        position: { x: noteX + (idx * HORIZONTAL_SPACING * 0.8), y: noteY },
        data: {
          label: hypothesis,
          type: 'note',
          color: NODE_COLORS.note,
        }
      })
      
      edges.push({
        id: `edge-${centralNodeId}-${noteId}`,
        source: centralNodeId,
        target: noteId,
        animated: false,
        type: 'smoothstep'
      })
    })
  }
  
  // ========================================
  // TOP: Opportunity Gap
  // ========================================
  if (journeyData.clarity?.opportunityGap) {
    const gapId = createId()
    
    nodes.push({
      id: gapId,
      type: 'idea',
      label: `💡 ${truncate(journeyData.clarity.opportunityGap, 45)}`,
      color: '#fbbf24', // amber-400 for opportunity
      position: { x: CENTER_X, y: CENTER_Y - VERTICAL_SPACING * 2 },
      data: {
        label: journeyData.clarity.opportunityGap,
        type: 'idea',
        color: '#fbbf24',
      }
    })
    
    edges.push({
      id: `edge-${gapId}-${centralNodeId}`,
      source: gapId,
      target: centralNodeId,
      animated: true,
      type: 'smoothstep'
    })
  }
  
  return { nodes, edges }
}

/**
 * Truncate text for node labels
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * Check if journey data has enough content to generate a meaningful mind map
 */
export function hasJourneyContent(journeyData: JourneyData | undefined): boolean {
  if (!journeyData) return false
  
  const hasClarity = !!(
    journeyData.clarity?.problemStatement ||
    journeyData.clarity?.targetUser
  )
  
  const hasResearch = !!(
    journeyData.research?.personas?.length ||
    journeyData.research?.painMap?.length
  )
  
  const hasBlueprint = !!(
    journeyData.blueprint?.features?.length
  )
  
  // Need at least clarity OR (research + blueprint)
  return hasClarity || (hasResearch && hasBlueprint)
}
