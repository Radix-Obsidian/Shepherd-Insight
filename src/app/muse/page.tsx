'use client'

/**
 * Shepherd Muse
 * 
 * "Understand Deeply"
 * 
 * Steve Jobs Style: Simple, clear, magical.
 * - Shows clarity summary from Compass
 * - Generates personas and pain points
 * - Reveals deep user understanding
 * 
 * Customer Transformation: "I have clarity" → "I understand my users deeply"
 */

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BookOpen, Loader2, ArrowRight, Users, Heart, Zap, Target, Lightbulb, AlertCircle } from 'lucide-react'
import { JourneyProgress } from '@/components/journey-progress'

interface Persona {
  name: string
  role: string
  goals: string[]
  frustrations: string[]
  quote: string
}

interface PainPoint {
  description: string
  frequency: string
  intensity: string
  currentSolution: string
}

interface ResearchOutput {
  personas: Persona[]
  painMap: PainPoint[]
  emotionalJourney: { stage: string; emotion: string; thought: string }[]
  insights: string[]
  competitorGaps: { competitor: string; weakness: string; opportunity: string }[]
}

interface ClarityOutput {
  problemStatement: string
  targetUser: string
  jobsToBeDone: string[]
  opportunityGap: string
}

type ViewState = 'loading-clarity' | 'input' | 'researching' | 'result' | 'error'

function MusePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const clarityId = searchParams.get('clarityId')

  const [viewState, setViewState] = useState<ViewState>('loading-clarity')
  const [clarity, setClarity] = useState<ClarityOutput | null>(null)
  const [research, setResearch] = useState<ResearchOutput | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [quickMode, setQuickMode] = useState(false)
  const [competitorUrls, setCompetitorUrls] = useState('')

  // Load clarity session on mount
  useEffect(() => {
    if (!clarityId) {
      setError('No clarity session found. Please complete Compass first.')
      setViewState('error')
      return
    }

    loadClaritySession(clarityId)
  }, [clarityId])

  const loadClaritySession = async (id: string) => {
    try {
      const response = await fetch(`/api/engine/clarity?id=${id}`)
      const result = await response.json()

      if (!result.success || !result.data?.clarity) {
        throw new Error(result.error || 'Failed to load clarity session')
      }

      setClarity(result.data.clarity)
      setViewState('input')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load clarity')
      setViewState('error')
    }
  }

  const handleStartResearch = async () => {
    if (!clarityId) return

    setViewState('researching')
    setError(null)

    try {
      const urls = competitorUrls
        .split('\n')
        .map(u => u.trim())
        .filter(u => u.length > 0)

      const response = await fetch('/api/engine/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claritySessionId: clarityId,
          competitorUrls: urls,
          quickMode,
        }),
      })

      const result = await response.json()

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to generate research')
      }

      setResearch(result.data.research)
      setSessionId(result.data.sessionId)
      setViewState('result')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setViewState('input')
    }
  }

  const handleContinueToBlueprint = () => {
    if (sessionId) {
      router.push(`/blueprint?researchId=${sessionId}&clarityId=${clarityId}`)
    }
  }

  const handleBackToCompass = () => {
    router.push('/compass')
  }

  const intensityColor = (intensity: string) => {
    switch (intensity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-6">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3 tracking-tight">
            Understand the humans behind your roadmap.
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Muse turns your clarity into rich personas, pain maps, and emotional journeys.
          </p>
        </div>

        {/* Journey Progress */}
        <JourneyProgress currentStep="muse" clarityId={clarityId} researchId={sessionId} />

        {/* Loading Clarity State */}
        {viewState === 'loading-clarity' && (
          <div className="text-center py-24">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-6" />
            <p className="text-lg text-slate-600">Loading your clarity...</p>
          </div>
        )}

        {/* Error State */}
        {viewState === 'error' && (
          <div className="max-w-xl mx-auto">
            <div className="flex items-center gap-4 p-6 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-semibold text-red-800">Something went wrong</h2>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
            <button
              onClick={handleBackToCompass}
              className="mt-6 w-full py-4 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
            >
              Go to Compass
            </button>
          </div>
        )}

        {/* Input View - Show clarity summary and research options */}
        {viewState === 'input' && clarity && (
          <div className="space-y-8">
            
            {/* Clarity Summary */}
            <div className="p-6 bg-amber-50 border-2 border-amber-200 rounded-xl">
              <h3 className="text-lg font-semibold text-amber-800 mb-3 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Your Clarity (from Compass)
              </h3>
              <p className="text-amber-900 font-medium mb-2">{clarity.problemStatement}</p>
              <p className="text-amber-700 text-sm">Target: {clarity.targetUser}</p>
            </div>

            {/* Research Options */}
            <div className="p-6 bg-white border-2 border-slate-200 rounded-xl space-y-6">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <label className="block text-lg font-medium text-slate-800">
                    Competitor URLs <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                    Max 3 URLs
                  </span>
                </div>
                <div className="relative">
                  <textarea
                    value={competitorUrls}
                    onChange={(e) => setCompetitorUrls(e.target.value)}
                    placeholder="https://stridekick.com&#10;https://strava.com&#10;https://runkeeper.com"
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none font-mono text-sm"
                  />
                  {competitorUrls.trim() === '' && (
                    <div className="absolute top-16 left-4 text-slate-400 text-xs pointer-events-none">
                      <p>💡 Enter one URL per line (press Enter after each)</p>
                    </div>
                  )}
                </div>
                <div className="mt-2 flex items-start gap-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                  <BookOpen className="w-4 h-4 mt-0.5 text-indigo-500 flex-shrink-0" />
                  <p>
                    <strong>How it works:</strong> Each URL on a new line. We&apos;ll analyze these competitors to find gaps and opportunities for your product.
                  </p>
                </div>
              </div>

              {/* Quick Mode Toggle */}
              <div className="flex items-start sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-slate-800">Quick Research Mode</p>
                    {quickMode && (
                      <span className="text-xs font-medium text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">
                    Skip web scraping • Use AI knowledge only • Faster results (~30 seconds)
                  </p>
                </div>
                <button
                  onClick={() => setQuickMode(!quickMode)}
                  className={`relative flex-shrink-0 w-16 h-9 rounded-full transition-all duration-300 shadow-inner ${
                    quickMode ? 'bg-indigo-500' : 'bg-slate-300'
                  }`}
                  aria-label="Toggle quick research mode"
                >
                  <span 
                    className={`absolute top-1 w-7 h-7 bg-white rounded-full shadow-md transition-all duration-300 ${
                      quickMode ? 'left-8' : 'left-1'
                    }`} 
                  />
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                {error}
              </div>
            )}

            {/* Start Research Button */}
            <button
              onClick={handleStartResearch}
              className="w-full py-5 px-8 bg-indigo-500 hover:bg-indigo-600 text-white text-xl font-semibold rounded-xl transition-colors flex items-center justify-center gap-3"
            >
              <Users className="w-6 h-6" />
              Discover My Users
            </button>

          </div>
        )}

        {/* Researching State */}
        {viewState === 'researching' && (
          <div className="py-12">
            {!quickMode ? (
              // Premium Perplexity Research UI
              <div className="max-w-2xl mx-auto">
                <div className="p-8 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 border-2 border-purple-200 rounded-2xl shadow-lg">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
                      <Zap className="w-5 h-5 text-purple-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-purple-900">
                        Deep Research in Progress
                      </h2>
                      <p className="text-purple-700">
                        Real-time web search with AI synthesis
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-purple-800">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                      <p className="text-sm font-medium">Searching the web for market insights...</p>
                    </div>
                    <div className="flex items-center gap-3 text-purple-800">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-100"></div>
                      <p className="text-sm font-medium">Analyzing competitor landscapes...</p>
                    </div>
                    <div className="flex items-center gap-3 text-purple-800">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-200"></div>
                      <p className="text-sm font-medium">Synthesizing user personas...</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-4 border-t border-purple-200">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-purple-600 font-medium">
                        Powered by Perplexity Sonar + Claude Sonnet 4
                      </p>
                      <div className="flex items-center gap-2 text-xs text-purple-600">
                        <Lightbulb className="w-4 h-4" />
                        <span>Premium Research Mode</span>
                      </div>
                    </div>
                    <p className="text-xs text-purple-500 italic">
                      Deep research takes 30-90 seconds. We&apos;re searching the live web for you...
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // Quick Mode (Groq)
              <div className="text-center py-24">
                <Loader2 className="w-16 h-16 text-indigo-500 animate-spin mx-auto mb-8" />
                <h2 className="text-2xl font-semibold text-slate-800 mb-3">
                  Quick Synthesis in Progress
                </h2>
                <p className="text-lg text-slate-600">
                  Creating personas from AI knowledge
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  Powered by Groq Llama 3.3
                </p>
              </div>
            )}
          </div>
        )}

        {/* Result View */}
        {viewState === 'result' && research && (
          <div className="space-y-8">
            
            {/* Success Banner */}
            <div className="flex items-center gap-4 p-6 bg-green-50 border border-green-200 rounded-xl">
              <Users className="w-8 h-8 text-green-600 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-semibold text-green-800">
                  Users Discovered
                </h2>
                <p className="text-green-700">
                  Here&apos;s who you&apos;re building for and what they need
                </p>
              </div>
            </div>

            {/* Personas */}
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-indigo-500" />
                Your User Personas
              </h3>
              <div className="grid gap-6 md:grid-cols-2">
                {research.personas.map((persona, index) => (
                  <div key={index} className="p-6 bg-white border-2 border-slate-200 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-xl font-bold text-indigo-600">
                        {persona.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{persona.name}</h4>
                        <p className="text-sm text-slate-500">{persona.role}</p>
                      </div>
                    </div>
                    
                    <blockquote className="italic text-slate-600 border-l-4 border-indigo-200 pl-4 mb-4">
                      &quot;{persona.quote}&quot;
                    </blockquote>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">Goals</p>
                        <ul className="text-sm text-slate-700 space-y-1">
                          {persona.goals.slice(0, 3).map((goal, i) => (
                            <li key={i}>• {goal}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">Frustrations</p>
                        <ul className="text-sm text-slate-700 space-y-1">
                          {persona.frustrations.slice(0, 3).map((frust, i) => (
                            <li key={i}>• {frust}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pain Map */}
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Heart className="w-6 h-6 text-red-500" />
                Pain Points Map
              </h3>
              <div className="space-y-4">
                {research.painMap.map((pain, index) => (
                  <div key={index} className="p-5 bg-white border-2 border-slate-200 rounded-xl">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 mb-2">{pain.description}</p>
                        <p className="text-sm text-slate-500">
                          <span className="font-medium">Currently:</span> {pain.currentSolution}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${intensityColor(pain.intensity)}`}>
                          {pain.intensity}
                        </span>
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {pain.frequency}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Insights */}
            <div className="p-6 bg-indigo-50 border-2 border-indigo-200 rounded-xl">
              <h3 className="text-lg font-bold text-indigo-800 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Key Insights
              </h3>
              <ul className="space-y-3">
                {research.insights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                    <span className="text-indigo-900">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Competitor Gaps */}
            {research.competitorGaps && research.competitorGaps.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">
                  Competitor Gaps (Your Opportunities)
                </h3>
                <div className="space-y-4">
                  {research.competitorGaps.map((gap, index) => (
                    <div key={index} className="p-5 bg-white border-2 border-slate-200 rounded-xl">
                      <p className="font-semibold text-slate-900 mb-2">{gap.competitor}</p>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-red-600 font-medium">Weakness:</p>
                          <p className="text-slate-700">{gap.weakness}</p>
                        </div>
                        <div>
                          <p className="text-green-600 font-medium">Your Opportunity:</p>
                          <p className="text-slate-700">{gap.opportunity}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleContinueToBlueprint}
                className="flex-1 py-5 px-8 bg-indigo-500 hover:bg-indigo-600 text-white text-xl font-semibold rounded-xl transition-colors flex items-center justify-center gap-3"
              >
                Continue to Blueprint
                <ArrowRight className="w-6 h-6" />
              </button>
              <button
                onClick={handleBackToCompass}
                className="py-5 px-8 bg-slate-100 hover:bg-slate-200 text-slate-700 text-lg font-medium rounded-xl transition-colors"
              >
                Back to Compass
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}

export default function MusePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    }>
      <MusePageContent />
    </Suspense>
  )
}
