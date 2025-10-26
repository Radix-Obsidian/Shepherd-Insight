export interface MindMapNode {
  id: string
  type: 'persona' | 'pain' | 'feature' | 'idea' | 'note'
  label: string
  color: string
  position: { x: number; y: number }
  data: {
    label: string
    type: string
    color: string
  }
}

export interface MindMapEdge {
  id: string
  source: string
  target: string
  animated?: boolean
  type?: 'smoothstep' | 'straight' | 'step'
}

export interface MindMapState {
  nodes: MindMapNode[]
  edges: MindMapEdge[]
  projectId: string | null
  selectedNode: string | null
}

export interface MindMapActions {
  addNode: (type: MindMapNode['type'], label: string, position?: { x: number; y: number }) => void
  updateNode: (id: string, updates: Partial<MindMapNode>) => void
  deleteNode: (id: string) => void
  addEdge: (source: string, target: string) => void
  deleteEdge: (id: string) => void
  reset: () => void
  importGraph: (data: { nodes: MindMapNode[]; edges: MindMapEdge[] }) => void
  loadFromLocalStorage: (projectId: string) => void
  saveToLocalStorage: (projectId: string, state: { nodes: MindMapNode[]; edges: MindMapEdge[] }) => void
  setSelectedNode: (nodeId: string | null) => void
}

export type MindMapStore = MindMapState & MindMapActions

// Node color mapping
export const NODE_COLORS = {
  persona: '#3b82f6', // blue-500
  pain: '#f97316',    // orange-500
  feature: '#10b981', // emerald-500
  idea: '#8b5cf6',    // violet-500
  note: '#f3f4f6',    // gray-100
} as const

export const NODE_TEXT_COLORS = {
  persona: '#ffffff',
  pain: '#ffffff',
  feature: '#ffffff',
  idea: '#ffffff',
  note: '#000000',
} as const
