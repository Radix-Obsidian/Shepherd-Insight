'use client'

/**
 * Mind Map Builder
 * 
 * Visualize your ideas with AI-powered mind map generation.
 * Works standalone or with Shepherd Journey data.
 */

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ReactFlowProvider } from 'reactflow'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MindMapBuilder } from '@/components/mindmap/MindMapBuilder'
import { Toolbar } from '@/components/mindmap/Toolbar'
import { AIControls } from '@/components/mindmap/AIControls'
import { useMindMapStore } from '@/lib/mindmap/store'
import { Compass, Sparkles } from 'lucide-react'

function MindMapPageContent() {
  const searchParams = useSearchParams()
  const projectId = searchParams.get('projectId')
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)
  
  const { loadFromLocalStorage, reset } = useMindMapStore()

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

  return (
    <div className="space-y-6">
      {/* Journey Tip Banner */}
      {!projectId && (
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-indigo-50 border border-amber-200 rounded-xl">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <p className="text-sm text-slate-700">
              <span className="font-medium">Pro tip:</span> Complete the Shepherd Journey first, then generate a mind map from your clarity, personas, or blueprint!
            </p>
          </div>
          <Link href="/compass">
            <Button size="sm" variant="outline" className="gap-2">
              <Compass className="w-4 h-4" />
              Start Journey
            </Button>
          </Link>
        </div>
      )}

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
