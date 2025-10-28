'use client'

import { useCallback, useMemo } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  NodeTypes,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { CustomNode } from './CustomNode'
import { useMindMapStore } from '@/lib/mindmap/store'
import { MindMapNode, MindMapEdge } from '@/lib/mindmap/types'

// Define nodeTypes at module scope to prevent React Flow warnings
const nodeTypes: NodeTypes = {
  customNode: CustomNode,
}

export function MindMapBuilder() {
  const { 
    nodes: storeNodes, 
    edges: storeEdges, 
    addEdge: addEdgeToStore,
    setSelectedNode 
  } = useMindMapStore()

  // Convert store nodes/edges to ReactFlow format
  const reactFlowNodes: Node[] = useMemo(() => 
    storeNodes.map((node: MindMapNode) => ({
      id: node.id,
      type: 'customNode',
      position: node.position,
      data: node.data,
    })), [storeNodes]
  )

  const reactFlowEdges: Edge[] = useMemo(() => 
    storeEdges.map((edge: MindMapEdge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      animated: edge.animated,
      type: edge.type,
    })), [storeEdges]
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(reactFlowNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(reactFlowEdges)

  // Sync ReactFlow state with store
  useMemo(() => {
    setNodes(reactFlowNodes)
  }, [reactFlowNodes, setNodes])

  useMemo(() => {
    setEdges(reactFlowEdges)
  }, [reactFlowEdges, setEdges])

  const onConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target) {
        addEdgeToStore(params.source, params.target)
      }
    },
    [addEdgeToStore]
  )

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setSelectedNode(node.id)
    },
    [setSelectedNode]
  )

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [setSelectedNode])

  return (
    <div id="mindmap-canvas" className="relative bg-white rounded-xl border shadow-sm h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} />
        <Controls />
        <MiniMap
          nodeColor={(node) => node.data?.color || '#3b82f6'}
          nodeStrokeWidth={3}
          zoomable
          pannable
        />
      </ReactFlow>
    </div>
  )
}
