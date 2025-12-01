'use client'

/**
 * Shepherd Blueprint
 * 
 * "Build With Purpose"
 * 
 * Steve Jobs Style: Simple, clear, magical.
 * - Takes clarity + research
 * - Generates prioritized MVP features
 * - Creates actionable roadmap
 * 
 * Customer Transformation: "I understand my users" → "I know exactly what to build first"
 */

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FileText, Loader2, Target, Rocket, CheckCircle2, Calendar, AlertTriangle, Download, Star } from 'lucide-react'
import { JourneyProgress } from '@/components/journey-progress'
import { useAppStore } from '@/lib/store'

interface UserStory {
  asA: string
  iWant: string
  soThat: string
}

interface MVPFeature {
  name: string
  description: string
  priority: 'must-have' | 'should-have' | 'nice-to-have'
  effort: 'small' | 'medium' | 'large'
  painPointsAddressed: string[]
  userStories: UserStory[]
}

interface RoadmapWeek {
  week: number
  theme: string
  goals: string[]
  deliverables: string[]
}

interface BlueprintOutput {
  productVision: string
  mvpScope: string
  coreValue: string
  features: MVPFeature[]
  roadmap: RoadmapWeek[]
  successMetrics: { metric: string; target: string; why: string }[]
  risks: { risk: string; mitigation: string }[]
  launchChecklist: string[]
}

type ViewState = 'loading' | 'generating' | 'result' | 'error'

function BlueprintPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const clarityId = searchParams.get('clarityId')
  const researchId = searchParams.get('researchId')
  const createProjectFromJourney = useAppStore(s => s.createProjectFromJourney)
  const createDecisionsFromJourney = useAppStore(s => s.createDecisionsFromJourney)

  const [viewState, setViewState] = useState<ViewState>('loading')
  const [blueprint, setBlueprint] = useState<BlueprintOutput | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [projectId, setProjectId] = useState<string | null>(null)
  const [versionId, setVersionId] = useState<string | null>(null)
  const [clarity, setClarity] = useState<any>(null)
  const [research, setResearch] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null)

  // Auto-generate blueprint on mount
  useEffect(() => {
    if (!clarityId || !researchId) {
      setError('Missing clarity or research session. Please complete previous steps first.')
      setViewState('error')
      return
    }

    generateBlueprint()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clarityId, researchId])

  const generateBlueprint = async () => {
    if (!clarityId || !researchId) return

    setViewState('generating')
    setError(null)

    try {
      const response = await fetch('/api/engine/blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claritySessionId: clarityId,
          researchSessionId: researchId,
        }),
      })

      const result = await response.json()

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to generate blueprint')
      }

      setBlueprint(result.data.blueprint)
      setSessionId(result.data.sessionId)
      
      // Fetch clarity and research data for saving
      const [clarityRes, researchRes] = await Promise.all([
        fetch(`/api/engine/clarity?id=${clarityId}`),
        fetch(`/api/engine/research?id=${researchId}`)
      ])
      
      const clarityData = await clarityRes.json()
      const researchData = await researchRes.json()
      
      if (clarityData.success && researchData.success) {
        setClarity(clarityData.data.clarity)
        setResearch(researchData.data.research)
        
        // Auto-save journey to store for exports and vault
        const { projectId: pid, versionId: vid } = createProjectFromJourney({
          projectName: clarityData.data.clarity.problemStatement?.split(' ').slice(0, 5).join(' ') || 'My Project',
          clarity: clarityData.data.clarity,
          research: researchData.data.research,
          blueprint: result.data.blueprint,
        })
        
        // Create decisions from journey data for Decision Vault
        createDecisionsFromJourney(pid, vid, {
          clarity: clarityData.data.clarity,
          research: researchData.data.research,
          blueprint: result.data.blueprint,
        })
        
        setProjectId(pid)
        setVersionId(vid)
      }
      
      setViewState('result')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setViewState('error')
    }
  }

  const handleExport = () => {
    if (!blueprint) return
    
    // Generate markdown export
    const markdown = generateMarkdownExport(blueprint)
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mvp-blueprint.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  const generateMarkdownExport = (bp: BlueprintOutput): string => {
    let md = `# MVP Blueprint\n\n`
    md += `## Product Vision\n${bp.productVision}\n\n`
    md += `## MVP Scope\n${bp.mvpScope}\n\n`
    md += `## Core Value\n${bp.coreValue}\n\n`
    
    md += `## Features\n\n`
    bp.features.forEach((f, i) => {
      md += `### ${i + 1}. ${f.name} [${f.priority}]\n`
      md += `${f.description}\n\n`
      md += `**Effort:** ${f.effort}\n\n`
      md += `**User Stories:**\n`
      f.userStories.forEach(s => {
        md += `- As a ${s.asA}, I want ${s.iWant}, so that ${s.soThat}\n`
      })
      md += `\n`
    })
    
    md += `## Roadmap\n\n`
    bp.roadmap.forEach(w => {
      md += `### Week ${w.week}: ${w.theme}\n`
      md += `**Goals:** ${w.goals.join(', ')}\n\n`
      md += `**Deliverables:**\n`
      w.deliverables.forEach(d => md += `- ${d}\n`)
      md += `\n`
    })
    
    md += `## Success Metrics\n\n`
    bp.successMetrics.forEach(m => {
      md += `- **${m.metric}:** ${m.target} (${m.why})\n`
    })
    
    md += `\n## Launch Checklist\n\n`
    bp.launchChecklist.forEach(item => {
      md += `- [ ] ${item}\n`
    })
    
    return md
  }

  const handleStartOver = () => {
    router.push('/compass')
  }

  const priorityColor = (priority: string) => {
    switch (priority) {
      case 'must-have': return 'bg-red-100 text-red-800 border-red-200'
      case 'should-have': return 'bg-amber-100 text-amber-800 border-amber-200'
      default: return 'bg-slate-100 text-slate-600 border-slate-200'
    }
  }

  const effortColor = (effort: string) => {
    switch (effort) {
      case 'small': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-amber-100 text-amber-800'
      default: return 'bg-red-100 text-red-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-6">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3 tracking-tight">
            A 4-week MVP plan you can stand behind.
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Blueprint turns your research into a focused feature list and launch path.
          </p>
        </div>

        {/* Journey Progress */}
        <JourneyProgress currentStep="blueprint" clarityId={clarityId} researchId={researchId} />

        {/* Loading State */}
        {viewState === 'loading' && (
          <div className="text-center py-24">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-6" />
            <p className="text-lg text-slate-600">Loading your journey...</p>
          </div>
        )}

        {/* Generating State */}
        {viewState === 'generating' && (
          <div className="text-center py-24">
            <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mx-auto mb-8" />
            <h2 className="text-2xl font-semibold text-slate-800 mb-3">
              Building your blueprint...
            </h2>
            <p className="text-lg text-slate-600">
              The Shepherd Engine is crafting your MVP plan
            </p>
          </div>
        )}

        {/* Error State */}
        {viewState === 'error' && (
          <div className="max-w-xl mx-auto">
            <div className="flex items-center gap-4 p-6 bg-red-50 border border-red-200 rounded-xl">
              <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-semibold text-red-800">Something went wrong</h2>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
            <button
              onClick={handleStartOver}
              className="mt-6 w-full py-4 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
            >
              Start Over
            </button>
          </div>
        )}

        {/* Result View */}
        {viewState === 'result' && blueprint && (
          <div className="space-y-8">
            
            {/* Success Banner */}
            <div className="flex items-center gap-4 p-6 bg-emerald-50 border border-emerald-200 rounded-xl">
              <Rocket className="w-8 h-8 text-emerald-600 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-semibold text-emerald-800">
                  Blueprint Ready
                </h2>
                <p className="text-emerald-700">
                  Your MVP plan is complete. Time to build!
                </p>
              </div>
            </div>

            {/* Product Vision */}
            <div className="p-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Star className="w-5 h-5" />
                Product Vision
              </h3>
              <p className="text-xl font-medium">{blueprint.productVision}</p>
            </div>

            {/* MVP Scope & Core Value */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-white border-2 border-slate-200 rounded-xl">
                <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-500" />
                  MVP Scope
                </h3>
                <p className="text-slate-700">{blueprint.mvpScope}</p>
              </div>
              <div className="p-6 bg-amber-50 border-2 border-amber-200 rounded-xl">
                <h3 className="text-lg font-bold text-amber-800 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Core Value (The ONE Thing)
                </h3>
                <p className="text-amber-900 font-medium">{blueprint.coreValue}</p>
              </div>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-emerald-500" />
                MVP Features ({blueprint.features.length})
              </h3>
              <div className="space-y-4">
                {blueprint.features.map((feature, index) => (
                  <div 
                    key={index} 
                    className="p-5 bg-white border-2 border-slate-200 rounded-xl cursor-pointer hover:border-emerald-300 transition-colors"
                    onClick={() => setExpandedFeature(expandedFeature === index ? null : index)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl font-bold text-emerald-500">{index + 1}</span>
                          <h4 className="text-lg font-semibold text-slate-900">{feature.name}</h4>
                        </div>
                        <p className="text-slate-600">{feature.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${priorityColor(feature.priority)}`}>
                          {feature.priority}
                        </span>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${effortColor(feature.effort)}`}>
                          {feature.effort}
                        </span>
                      </div>
                    </div>
                    
                    {/* Expanded Content */}
                    {expandedFeature === index && (
                      <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
                        {feature.painPointsAddressed.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-slate-500 mb-2">Pain Points Addressed:</p>
                            <div className="flex flex-wrap gap-2">
                              {feature.painPointsAddressed.map((pain, i) => (
                                <span key={i} className="px-3 py-1 text-sm bg-red-50 text-red-700 rounded-full">
                                  {pain}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {feature.userStories.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-slate-500 mb-2">User Stories:</p>
                            <div className="space-y-2">
                              {feature.userStories.map((story, i) => (
                                <div key={i} className="p-3 bg-slate-50 rounded-lg text-sm">
                                  <span className="text-slate-600">As a </span>
                                  <span className="font-medium text-slate-800">{story.asA}</span>
                                  <span className="text-slate-600">, I want </span>
                                  <span className="font-medium text-slate-800">{story.iWant}</span>
                                  <span className="text-slate-600">, so that </span>
                                  <span className="font-medium text-slate-800">{story.soThat}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Roadmap */}
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-emerald-500" />
                Roadmap
              </h3>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-emerald-200" />
                
                <div className="space-y-6">
                  {blueprint.roadmap.map((week, index) => (
                    <div key={index} className="relative pl-16">
                      {/* Timeline dot */}
                      <div className="absolute left-4 top-2 w-5 h-5 bg-emerald-500 rounded-full border-4 border-emerald-100" />
                      
                      <div className="p-5 bg-white border-2 border-slate-200 rounded-xl">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="px-3 py-1 text-sm font-bold bg-emerald-100 text-emerald-800 rounded-full">
                            Week {week.week}
                          </span>
                          <h4 className="font-semibold text-slate-900">{week.theme}</h4>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Goals</p>
                            <ul className="text-sm text-slate-700 space-y-1">
                              {week.goals.map((goal, i) => (
                                <li key={i}>• {goal}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Deliverables</p>
                            <ul className="text-sm text-slate-700 space-y-1">
                              {week.deliverables.map((d, i) => (
                                <li key={i}>✓ {d}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Success Metrics */}
            {blueprint.successMetrics && blueprint.successMetrics.length > 0 && (
              <div className="p-6 bg-indigo-50 border-2 border-indigo-200 rounded-xl">
                <h3 className="text-lg font-bold text-indigo-800 mb-4">Success Metrics</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {blueprint.successMetrics.map((metric, index) => (
                    <div key={index} className="p-4 bg-white rounded-lg">
                      <p className="font-semibold text-indigo-900">{metric.metric}</p>
                      <p className="text-2xl font-bold text-indigo-600">{metric.target}</p>
                      <p className="text-sm text-indigo-700">{metric.why}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risks */}
            {blueprint.risks && blueprint.risks.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Risks & Mitigations
                </h3>
                <div className="space-y-3">
                  {blueprint.risks.map((risk, index) => (
                    <div key={index} className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="font-medium text-amber-900 mb-1">{risk.risk}</p>
                      <p className="text-sm text-amber-700">→ {risk.mitigation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Launch Checklist */}
            {blueprint.launchChecklist && blueprint.launchChecklist.length > 0 && (
              <div className="p-6 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
                <h3 className="text-lg font-bold text-emerald-800 mb-4 flex items-center gap-2">
                  <Rocket className="w-5 h-5" />
                  Launch Checklist
                </h3>
                <div className="space-y-2">
                  {blueprint.launchChecklist.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-emerald-400 rounded" />
                      <span className="text-emerald-900">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4 pt-4">
              <div className="p-6 bg-gradient-to-r from-amber-50 to-emerald-50 border-2 border-amber-200 rounded-xl">
                <h3 className="text-lg font-bold text-slate-800 mb-2">✨ Your Journey is Saved!</h3>
                <p className="text-sm text-slate-600 mb-4">
                  All your decisions from Compass, Muse, and Blueprint are now available in your Vault and ready to export.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  {projectId && versionId && (
                    <>
                      <button
                        onClick={() => router.push(`/vault?projectId=${projectId}&versionId=${versionId}`)}
                        className="flex-1 py-3 px-6 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Target className="w-5 h-5" />
                        View in Vault
                      </button>
                      <button
                        onClick={() => router.push(`/exports?projectId=${projectId}&versionId=${versionId}`)}
                        className="flex-1 py-3 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Download className="w-5 h-5" />
                        Export All
                      </button>
                    </>
                  )}
                  <button
                    onClick={handleStartOver}
                    className="py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
                  >
                    Start New Journey
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}

export default function BlueprintPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    }>
      <BlueprintPageContent />
    </Suspense>
  )
}
