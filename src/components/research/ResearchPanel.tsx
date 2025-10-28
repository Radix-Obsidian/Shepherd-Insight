'use client'

import { logger } from '@/lib/logger'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ExternalLink,
  Brain,
  Network
} from 'lucide-react'

interface ResearchPanelProps {
  isOpen: boolean
  onClose: () => void
  onComplete?: (data: ResearchResult) => void
}

interface ResearchStep {
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
}

interface ResearchPainPoint {
  description: string
  [key: string]: unknown
}

interface ResearchInsightData {
  pain_points?: ResearchPainPoint[]
  MVP_features?: string[]
}

interface ResearchCitation {
  url: string
  title?: string
}

interface ResearchResult {
  mindmapJson?: unknown
  insightData?: ResearchInsightData
  citations?: ResearchCitation[]
  [key: string]: unknown
}

export function ResearchPanel({ isOpen, onClose, onComplete }: ResearchPanelProps) {
  const [query, setQuery] = useState('')
  const [depth, setDepth] = useState([2])
  const [includeImages, setIncludeImages] = useState(false)
  const [competitorUrls, setCompetitorUrls] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [steps, setSteps] = useState<ResearchStep[]>([])
  const [currentStep, setCurrentStep] = useState<ResearchStep | null>(null)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<ResearchResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleStartResearch = async () => {
    if (!query.trim()) return

    setIsRunning(true)
    setError(null)
    setResult(null)
    setProgress(0)

    // Initialize steps
    const initialSteps: ResearchStep[] = [
      { name: 'Planning', status: 'running', progress: 0 },
      { name: 'Gathering', status: 'pending', progress: 0 },
      { name: 'Extracting', status: 'pending', progress: 0 },
      { name: 'Synthesizing', status: 'pending', progress: 0 },
      { name: 'Validating', status: 'pending', progress: 0 },
      { name: 'Formatting', status: 'pending', progress: 0 },
    ]
    setSteps(initialSteps)
    setCurrentStep(initialSteps[0])

    try {
      const response = await fetch('/api/research/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          depth: depth[0],
          includeImages,
          competitorUrls: competitorUrls.split(',').map(url => url.trim()).filter(Boolean),
        }),
      })

      if (!response.ok) {
        throw new Error('Research failed')
      }

      const data = (await response.json()) as ResearchResult
      setResult(data)
      setProgress(100)
      
      // Update all steps to completed
      setSteps(prev => prev.map(step => ({ ...step, status: 'completed', progress: 100 })))
      setCurrentStep(null)

      onComplete?.(data)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Research failed'
      setError(message)
      setSteps(prev => prev.map(step => ({ 
        ...step, 
        status: step.status === 'running' ? 'failed' : step.status 
      })))
    } finally {
      setIsRunning(false)
    }
  }

  const handleViewMindMap = () => {
    if (result?.mindmapJson) {
      // TODO: Open mind map with generated data
      logger.debug('Opening mind map with data', result.mindmapJson)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Research Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isRunning && !result && (
            <>
              {/* Input Section */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="query">Research Query</Label>
                  <Textarea
                    id="query"
                    placeholder="e.g., 'Create a mobile app for busy parents to track their children's activities and coordinate with other parents'"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="depth">Search Depth: {depth[0]}</Label>
                    <Slider
                      id="depth"
                      min={1}
                      max={3}
                      step={1}
                      value={depth}
                      onValueChange={setDepth}
                      className="mt-2"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="includeImages"
                      checked={includeImages}
                      onCheckedChange={setIncludeImages}
                    />
                    <Label htmlFor="includeImages">Include Images</Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="competitorUrls">Competitor URLs (comma-separated)</Label>
                  <Input
                    id="competitorUrls"
                    placeholder="https://competitor1.com, https://competitor2.com"
                    value={competitorUrls}
                    onChange={(e) => setCompetitorUrls(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleStartResearch}
                  disabled={!query.trim()}
                  className="flex-1"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Research
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </>
          )}

          {/* Progress Section */}
          {isRunning && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Research Progress</h3>
                <Badge variant="outline">
                  {Math.round(progress)}% Complete
                </Badge>
              </div>

              <Progress value={progress} className="w-full" />

              {currentStep && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Currently: {currentStep.name}
                </div>
              )}

              <div className="space-y-2">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {step.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {step.status === 'running' && <Clock className="h-4 w-4 text-blue-500" />}
                    {step.status === 'failed' && <XCircle className="h-4 w-4 text-red-500" />}
                    {step.status === 'pending' && <div className="h-4 w-4 rounded-full border-2 border-gray-300" />}
                    <span className={step.status === 'completed' ? 'text-green-600' : step.status === 'failed' ? 'text-red-600' : ''}>
                      {step.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results Section */}
          {result && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Research Complete</h3>
                <div className="flex gap-2">
                  <Button onClick={handleViewMindMap} variant="outline">
                    <Network className="h-4 w-4 mr-2" />
                    View Mind Map
                  </Button>
                  <Button onClick={onClose}>
                    Close
                  </Button>
                </div>
              </div>

              {result.insightData && (
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Pain Points</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        {result.insightData.pain_points?.slice(0, 3).map((pain: ResearchPainPoint, index: number) => (
                          <div key={index} className="text-sm text-muted-foreground">
                            • {pain.description}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">MVP Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        {result.insightData.MVP_features?.slice(0, 3).map((feature: string, index: number) => (
                          <div key={index} className="text-sm text-muted-foreground">
                            • {feature}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {result.citations && result.citations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Sources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {result.citations.slice(0, 5).map((citation: ResearchCitation, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <ExternalLink className="h-3 w-3" />
                          <a 
                            href={citation.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {citation.title || citation.url}
                          </a>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <XCircle className="h-4 w-4" />
                <span className="font-medium">Research Failed</span>
              </div>
              <p className="text-red-700 mt-1">{error}</p>
              <Button 
                onClick={() => setError(null)} 
                variant="outline" 
                size="sm" 
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
