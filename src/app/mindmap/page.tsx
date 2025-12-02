'use client'

/**
 * Mind Map Builder
 * 
 * Steve Jobs: "Start with the customer experience and work backwards to the technology."
 * 
 * This page SHOWS users what they built in their Shepherd Journey.
 * No re-interpretation needed - their data becomes a visual map.
 */

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ReactFlowProvider } from 'reactflow'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MindMapBuilder } from '@/components/mindmap/MindMapBuilder'
import { Toolbar } from '@/components/mindmap/Toolbar'
import { AIControls } from '@/components/mindmap/AIControls'
import { useMindMapStore } from '@/lib/mindmap/store'
import { useAppStore } from '@/lib/store'
import { generateMindMapFromJourney, hasJourneyContent } from '@/lib/mindmap/journey-generator'
import { Compass, Sparkles, RefreshCw, Wand2 } from 'lucide-react'

interface JourneyDataType {
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

function MindMapPageContent() {
  const searchParams = useSearchParams()
  const projectId = searchParams.get('projectId')
  const versionId = searchParams.get('versionId')
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [hasGeneratedFromJourney, setHasGeneratedFromJourney] = useState(false)
  const [journeyData, setJourneyData] = useState<JourneyDataType | null>(null)
  const [projectName, setProjectName] = useState<string>('My Product')
  const canvasRef = useRef<HTMLDivElement>(null)
  
  const { loadFromLocalStorage, reset, importGraph, nodes } = useMindMapStore()
  const getProjectVersion = useAppStore(s => s.getProjectVersion)
  const getProject = useAppStore(s => s.getProject)

  // Generate mind map from journey data
  const generateFromJourney = useCallback(() => {
    if (!journeyData || !hasJourneyContent(journeyData)) return
    
    const { nodes: generatedNodes, edges: generatedEdges } = generateMindMapFromJourney(
      projectName,
      journeyData
    )
    
    importGraph({ nodes: generatedNodes, edges: generatedEdges })
    setHasGeneratedFromJourney(true)
  }, [journeyData, projectName, importGraph])

  // Load journey data and auto-generate
  useEffect(() => {
    if (projectId && versionId) {
      const version = getProjectVersion(projectId, versionId)
      const project = getProject(projectId)
      
      if (project?.name) {
        setProjectName(project.name)
      }
      
      if (version?.data?.journeyData) {
        setJourneyData(version.data.journeyData)
      }
      
      // Load existing mindmap from localStorage
      loadFromLocalStorage(projectId)
    }
  }, [projectId, versionId, loadFromLocalStorage, getProjectVersion, getProject])

  // Auto-generate on first load if we have journey data and no existing map
  useEffect(() => {
    if (journeyData && hasJourneyContent(journeyData) && nodes.length === 0 && !hasGeneratedFromJourney) {
      generateFromJourney()
    }
  }, [journeyData, nodes.length, hasGeneratedFromJourney, generateFromJourney])

  const handleReset = () => {
    reset()
    setHasGeneratedFromJourney(false)
    setIsResetModalOpen(false)
  }

  const handleRegenerate = () => {
    reset()
    setTimeout(() => {
      generateFromJourney()
    }, 100)
  }

  const hasJourney = journeyData && hasJourneyContent(journeyData)

  return (
    <div className="space-y-6">
      {/* Journey Success Banner - Show when map is generated from journey */}
      {hasJourney && hasGeneratedFromJourney && (
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            <p className="text-sm text-slate-700">
              <span className="font-medium">✨ Your journey visualized!</span> This map was built from your Compass, Muse, and Blueprint data.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={handleRegenerate} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Regenerate
          </Button>
        </div>
      )}

      {/* No Journey Banner - Guide users to start journey */}
      {!projectId && (
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-indigo-50 border border-amber-200 rounded-xl">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <p className="text-sm text-slate-700">
              <span className="font-medium">Pro tip:</span> Complete the Shepherd Journey first to auto-generate a mind map from your insights!
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
            {hasJourney 
              ? 'Your product vision, visualized from your Shepherd Journey.'
              : 'Visualize your product insights: drag ideas, connect pains to features, or let AI build the first draft.'
            }
          </p>
        </div>
        <div className="flex gap-2">
          {hasJourney ? (
            <Button onClick={handleRegenerate} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Regenerate from Journey
            </Button>
          ) : (
            <Button onClick={() => setIsAIModalOpen(true)} className="gap-2">
              <Wand2 className="w-4 h-4" />
              Generate AI Map
            </Button>
          )}
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

      {/* AI Controls Modal - Only for users without journey data */}
      <AIControls 
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        initialText=""
        hasJourneyData={false}
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
