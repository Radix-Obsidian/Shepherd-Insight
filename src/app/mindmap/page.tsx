'use client'

import { logger } from '@/lib/logger';
import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ReactFlowProvider } from 'reactflow'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MindMapBuilder } from '@/components/mindmap/MindMapBuilder'
import { Toolbar } from '@/components/mindmap/Toolbar'
import { AIControls } from '@/components/mindmap/AIControls'
import { useMindMapStore } from '@/lib/mindmap/store'

function MindMapPageContent() {
  const searchParams = useSearchParams()
  const projectId = searchParams.get('projectId')
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)
  
  const { loadFromLocalStorage, reset, nodes, edges } = useMindMapStore()

  // Load mind map data on mount
  useEffect(() => {
    if (projectId) {
      loadFromLocalStorage(projectId)
    }
  }, [projectId, loadFromLocalStorage])

  const handleReset = () => {
    reset()
    setIsResetModalOpen(false)
  }

  const handleExport = (type: 'image' | 'pdf' | 'presentation') => {
    // TODO: Implement export functionality
    logger.debug(`Export as ${type}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mind Map Builder</h1>
          <p className="text-muted-foreground mt-2">
            Visualize your product insights: drag ideas, connect pains to features, or let AI build the first draft.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsAIModalOpen(true)}>
            Generate AI Map
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsResetModalOpen(true)}
          >
            Reset Canvas
          </Button>
          <Button variant="outline">
            Export
          </Button>
        </div>
      </div>

      {/* Mind Map Canvas with ReactFlowProvider */}
      <ReactFlowProvider>
        {/* Toolbar */}
        <Toolbar canvasRef={canvasRef} />

        {/* Main Canvas */}
        <Card>
          <CardContent className="p-0">
            <div ref={canvasRef} className="h-[600px] w-full">
              <MindMapBuilder />
            </div>
          </CardContent>
        </Card>
      </ReactFlowProvider>

      {/* AI Controls Modal */}
      <AIControls 
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />

      {/* Reset Confirmation Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Reset Canvas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Are you sure you want to reset the canvas? This will remove all nodes and edges.
              </p>
              <div className="flex gap-2">
                <Button onClick={handleReset} variant="destructive">
                  Reset
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsResetModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default function MindMapPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MindMapPageContent />
    </Suspense>
  )
}