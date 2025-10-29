'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ReactFlowProvider } from 'reactflow'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MindMapBuilder } from '@/components/mindmap/MindMapBuilder'
import { Toolbar } from '@/components/mindmap/Toolbar'
import { AIControls } from '@/components/mindmap/AIControls'
import { useMindMapStore } from '@/lib/mindmap/store'
import { generateMindMapFromInsight } from '@/lib/research/insight-to-mindmap'
import { InsightData } from '@/types/insight'
import { logger } from '@/lib/logger'

function MindMapPageContent() {
  const searchParams = useSearchParams()
  const projectId = searchParams.get('projectId')
  const versionId = searchParams.get('versionId')
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const canvasRef = useRef<HTMLDivElement>(null)
  
  const { loadFromLocalStorage, importGraph, reset, setProjectId } = useMindMapStore()

  // Load mind map data from Supabase insights
  useEffect(() => {
    async function loadMindMapData() {
      if (!projectId) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setProjectId(projectId)

      try {
        // First, try to load from Supabase insights
        const insightResponse = await fetch(`/api/insights?projectId=${projectId}`)
        
        if (insightResponse.ok) {
          const { insight } = await insightResponse.json()
          
          if (insight) {
            // Convert insight data to mindmap format
            try {
              const mindMapData = generateMindMapFromInsight(insight as InsightData)
              importGraph(mindMapData)
              setIsLoading(false)
              return
            } catch (conversionError) {
              logger.error('Failed to convert insight to mindmap:', conversionError)
              // Fall through to try version data or localStorage
            }
          }
        }

        // Fallback: Try to generate from version data
        if (versionId) {
          try {
            const projectResponse = await fetch(`/api/supabase?action=project&projectId=${projectId}`)
            if (projectResponse.ok) {
              const { project } = await projectResponse.json()
              const version = project?.versions?.find((v: { id: string }) => v.id === versionId)
              
              if (version) {
                // Create a basic insight structure from version data
                const basicInsight: InsightData = {
                  pain_points: version.problem ? [{
                    id: 'pain-1',
                    description: version.problem,
                    severity: 'medium' as const,
                    frequency: 1,
                    sources: [],
                  }] : [],
                  personas: version.audience ? [{
                    id: 'persona-1',
                    name: version.audience,
                    description: `Target audience: ${version.audience}`,
                    pain_points: [],
                    goals: [],
                    demographics: {
                      age_range: 'Unknown',
                      income: 'Unknown',
                      location: 'Unknown',
                    },
                  }] : [],
                  MVP_features: version.must_haves || [],
                  out_of_scope: version.not_now || [],
                  competitors: [],
                  opportunities: [],
                  citations: [],
                }
                
                const mindMapData = generateMindMapFromInsight(basicInsight)
                importGraph(mindMapData)
                setIsLoading(false)
                return
              }
            }
          } catch (versionError) {
            logger.error('Failed to load version data:', versionError)
          }
        }

        // Final fallback: Try localStorage
        loadFromLocalStorage(projectId)
      } catch (error) {
        logger.error('Failed to load mindmap data:', error)
        // Fallback to localStorage
        loadFromLocalStorage(projectId)
      } finally {
        setIsLoading(false)
      }
    }

    loadMindMapData()
  }, [projectId, versionId, importGraph, loadFromLocalStorage, setProjectId])

  const handleReset = () => {
    reset()
    setIsResetModalOpen(false)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mind Map Builder</h1>
          <p className="text-muted-foreground mt-2">Loading mind map data...</p>
        </div>
      </div>
    )
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
