import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { MindMapNode, MindMapEdge, MindMapStore, NODE_COLORS } from './types'
import { logger } from '@/lib/logger';

export const useMindMapStore = create<MindMapStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      nodes: [],
      edges: [],
      projectId: null,
      selectedNode: null,

      // Actions
      addNode: (type, label, position) => {
        const id = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const node: MindMapNode = {
          id,
          type,
          label,
          color: NODE_COLORS[type],
          position: position || { x: 0, y: 0 },
          data: {
            label,
            type,
            color: NODE_COLORS[type],
          },
        }

        set((state) => ({
          nodes: [...state.nodes, node],
        }))

        // Auto-save to localStorage
        const currentState = get()
        if (currentState.projectId) {
          get().saveToLocalStorage(currentState.projectId, {
            nodes: [...currentState.nodes, node],
            edges: currentState.edges,
          })
        }
      },

      updateNode: (id, updates) => {
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === id ? { ...node, ...updates } : node
          ),
        }))

        // Auto-save to localStorage
        const currentState = get()
        if (currentState.projectId) {
          get().saveToLocalStorage(currentState.projectId, {
            nodes: currentState.nodes.map((node) =>
              node.id === id ? { ...node, ...updates } : node
            ),
            edges: currentState.edges,
          })
        }
      },

      deleteNode: (id) => {
        set((state) => ({
          nodes: state.nodes.filter((node) => node.id !== id),
          edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id),
        }))

        // Auto-save to localStorage
        const currentState = get()
        if (currentState.projectId) {
          get().saveToLocalStorage(currentState.projectId, {
            nodes: currentState.nodes.filter((node) => node.id !== id),
            edges: currentState.edges.filter((edge) => edge.source !== id && edge.target !== id),
          })
        }
      },

      addEdge: (source, target) => {
        const id = `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const edge: MindMapEdge = {
          id,
          source,
          target,
          animated: true,
          type: 'smoothstep',
        }

        set((state) => ({
          edges: [...state.edges, edge],
        }))

        // Auto-save to localStorage
        const currentState = get()
        if (currentState.projectId) {
          get().saveToLocalStorage(currentState.projectId, {
            nodes: currentState.nodes,
            edges: [...currentState.edges, edge],
          })
        }
      },

      deleteEdge: (id) => {
        set((state) => ({
          edges: state.edges.filter((edge) => edge.id !== id),
        }))

        // Auto-save to localStorage
        const currentState = get()
        if (currentState.projectId) {
          get().saveToLocalStorage(currentState.projectId, {
            nodes: currentState.nodes,
            edges: currentState.edges.filter((edge) => edge.id !== id),
          })
        }
      },

      reset: () => {
        set({
          nodes: [],
          edges: [],
          selectedNode: null,
        })

        // Clear localStorage
        const currentState = get()
        if (currentState.projectId) {
          localStorage.removeItem(`mindmap-${currentState.projectId}`)
        }
      },

      importGraph: (data) => {
        set({
          nodes: data.nodes,
          edges: data.edges,
          selectedNode: null,
        })

        // Auto-save to localStorage
        const currentState = get()
        if (currentState.projectId) {
          get().saveToLocalStorage(currentState.projectId, data)
        }
      },

      loadFromLocalStorage: (projectId) => {
        try {
          const saved = localStorage.getItem(`mindmap-${projectId}`)
          if (saved) {
            const data = JSON.parse(saved)
            set({
              nodes: data.nodes || [],
              edges: data.edges || [],
              projectId,
              selectedNode: null,
            })
          } else {
            set({ projectId })
          }
        } catch (error) {
          logger.error('Failed to load mind map from localStorage:', error)
          set({ projectId })
        }
      },

      saveToLocalStorage: (projectId, state) => {
        try {
          localStorage.setItem(`mindmap-${projectId}`, JSON.stringify(state))
        } catch (error) {
          logger.error('Failed to save mind map to localStorage:', error)
        }
      },

      setSelectedNode: (nodeId) => {
        set({ selectedNode: nodeId })
      },
    }),
    {
      name: 'mindmap-store',
    }
  )
)

// Selectors
export const useMindMapNodes = () => useMindMapStore((state) => state.nodes)
export const useMindMapEdges = () => useMindMapStore((state) => state.edges)
export const useMindMapProjectId = () => useMindMapStore((state) => state.projectId)
export const useMindMapSelectedNode = () => useMindMapStore((state) => state.selectedNode)
