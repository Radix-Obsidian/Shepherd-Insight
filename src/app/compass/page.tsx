'use client'

/**
 * Shepherd Compass
 * 
 * "Find Clarity"
 * 
 * Steve Jobs Style: Simple, clean, magical.
 * - Big input for the idea
 * - Clear output showing the transformation
 * - Obvious next step
 * 
 * Customer Transformation: "I&apos;m feeling a bit lost with where to start..." → "I have clarity"
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Compass, Loader2, ArrowRight, Lightbulb, Target, Sparkles, CheckCircle } from 'lucide-react'
import { JourneyProgress } from '@/components/journey-progress'

interface ClarityOutput {
  problemStatement: string
  targetUser: string
  jobsToBeDone: string[]
  opportunityGap: string
  valueHypotheses: string[]
  nextSteps: string[]
}

interface ClarityResponse {
  success: boolean
  data?: {
    sessionId: string
    clarity: ClarityOutput
  }
  error?: string
}

type ViewState = 'input' | 'loading' | 'result'

// Idea starters to help users who freeze at a blank prompt
const IDEA_STARTERS = [
  {
    title: "Help busy people",
    prompt: "I want to build an app that helps busy professionals manage their time better by automatically scheduling tasks based on energy levels and priorities",
    audience: "Working professionals aged 25-45 who struggle with work-life balance"
  },
  {
    title: "Solve a daily frustration",
    prompt: "I'm thinking about creating a service that makes meal planning easier for families by suggesting recipes based on what's already in the fridge",
    audience: "Parents with young children who want to eat healthier but lack time"
  },
  {
    title: "Connect a community",
    prompt: "My idea is to build a platform where local small business owners can collaborate, share resources, and refer customers to each other",
    audience: "Small business owners in local communities"
  },
  {
    title: "Simplify something complex",
    prompt: "I want to create a tool that makes personal finance easier to understand for people who've never learned about investing or budgeting",
    audience: "Young adults starting their first job who feel overwhelmed by money"
  },
  {
    title: "Empower creators",
    prompt: "I'm building a platform that helps independent artists sell their work directly to collectors without gallery middlemen",
    audience: "Independent artists and art collectors"
  },
]

export default function CompassPage() {
  const router = useRouter()
  const [viewState, setViewState] = useState<ViewState>('input')
  const [idea, setIdea] = useState('')
  const [targetUser, setTargetUser] = useState('')
  const [clarity, setClarity] = useState<ClarityOutput | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleUseStarter = (starter: typeof IDEA_STARTERS[0]) => {
    setIdea(starter.prompt)
    setTargetUser(starter.audience)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!idea.trim() || idea.trim().length < 10) {
      setError('Tell us more about your idea (at least 10 characters)')
      return
    }

    setError(null)
    setViewState('loading')

    try {
      const response = await fetch('/api/engine/clarity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: idea.trim(),
          targetUser: targetUser.trim() || undefined,
        }),
      })

      const result: ClarityResponse = await response.json()

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to generate clarity')
      }

      setClarity(result.data.clarity)
      setSessionId(result.data.sessionId)
      setViewState('result')

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setViewState('input')
    }
  }

  const handleContinueToMuse = () => {
    if (sessionId) {
      router.push(`/muse?clarityId=${sessionId}`)
    }
  }

  const handleStartOver = () => {
    setIdea('')
    setTargetUser('')
    setClarity(null)
    setSessionId(null)
    setViewState('input')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-6">
            <Compass className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Shepherd Compass
          </h1>
          <p className="text-xl text-slate-600">
            Find Clarity
          </p>
        </div>

        {/* Journey Progress */}
        <JourneyProgress currentStep="compass" clarityId={sessionId} />

        {/* Input View */}
        {viewState === 'input' && (
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Main Idea Input - BIG */}
            <div>
              <label className="block text-lg font-medium text-slate-800 mb-3">
                What's your idea?
              </label>
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="I want to build an app that helps... / I'm thinking about creating a service for... / My idea is to solve the problem of..."
                className="w-full h-48 px-5 py-4 text-lg border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all resize-none"
                autoFocus
              />
              <p className="mt-2 text-sm text-slate-500">
                Don't worry about being perfect. Just describe your idea as you think about it.
              </p>
            </div>

            {/* Idea Starters - Help for blank page syndrome */}
            {!idea && (
              <div className="pt-2">
                <p className="text-sm font-medium text-slate-600 mb-3">
                  Need inspiration? Try one of these:
                </p>
                <div className="flex flex-wrap gap-2">
                  {IDEA_STARTERS.map((starter, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleUseStarter(starter)}
                      className="px-4 py-2 text-sm bg-slate-100 hover:bg-amber-100 hover:text-amber-800 text-slate-600 rounded-full transition-colors border border-slate-200 hover:border-amber-300"
                    >
                      {starter.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Optional Target User */}
            <div>
              <label className="block text-lg font-medium text-slate-800 mb-3">
                Who is this for? <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={targetUser}
                onChange={(e) => setTargetUser(e.target.value)}
                placeholder="e.g., Busy parents, freelance designers, small business owners..."
                className="w-full px-5 py-4 text-lg border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-5 px-8 bg-amber-500 hover:bg-amber-600 text-white text-xl font-semibold rounded-xl transition-colors flex items-center justify-center gap-3"
            >
              <Sparkles className="w-6 h-6" />
              Find My Clarity
            </button>

          </form>
        )}

        {/* Loading View */}
        {viewState === 'loading' && (
          <div className="text-center py-24">
            <Loader2 className="w-16 h-16 text-amber-500 animate-spin mx-auto mb-8" />
            <h2 className="text-2xl font-semibold text-slate-800 mb-3">
              Analyzing your idea...
            </h2>
            <p className="text-lg text-slate-600">
              The Shepherd Engine is working its magic
            </p>
          </div>
        )}

        {/* Result View */}
        {viewState === 'result' && clarity && (
          <div className="space-y-8">
            
            {/* Success Banner */}
            <div className="flex items-center gap-4 p-6 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-semibold text-green-800">
                  Clarity Found
                </h2>
                <p className="text-green-700">
                  Here's what we discovered about your idea
                </p>
              </div>
            </div>

            {/* Problem Statement - Hero Section */}
            <div className="p-8 bg-slate-900 text-white rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-amber-400" />
                <h3 className="text-lg font-medium text-amber-400">The Problem</h3>
              </div>
              <p className="text-2xl font-semibold leading-relaxed">
                {clarity.problemStatement}
              </p>
            </div>

            {/* Target User */}
            <div className="p-6 bg-white border-2 border-slate-200 rounded-xl">
              <h3 className="text-lg font-semibold text-slate-800 mb-3">
                Your Target User
              </h3>
              <p className="text-lg text-slate-700">
                {clarity.targetUser}
              </p>
            </div>

            {/* Jobs To Be Done */}
            <div className="p-6 bg-white border-2 border-slate-200 rounded-xl">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Jobs To Be Done
              </h3>
              <ul className="space-y-3">
                {clarity.jobsToBeDone.map((job, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </span>
                    <span className="text-lg text-slate-700">{job}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Opportunity Gap */}
            <div className="p-6 bg-amber-50 border-2 border-amber-200 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <Lightbulb className="w-6 h-6 text-amber-600" />
                <h3 className="text-lg font-semibold text-amber-800">
                  The Opportunity
                </h3>
              </div>
              <p className="text-lg text-amber-900">
                {clarity.opportunityGap}
              </p>
            </div>

            {/* Value Hypotheses */}
            <div className="p-6 bg-white border-2 border-slate-200 rounded-xl">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Value Hypotheses
              </h3>
              <ul className="space-y-3">
                {clarity.valueHypotheses.map((hypothesis, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0 mt-1" />
                    <span className="text-lg text-slate-700">{hypothesis}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Next Steps */}
            <div className="p-6 bg-white border-2 border-slate-200 rounded-xl">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Recommended Next Steps
              </h3>
              <ul className="space-y-3">
                {clarity.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                    <span className="text-lg text-slate-700">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleContinueToMuse}
                className="flex-1 py-5 px-8 bg-amber-500 hover:bg-amber-600 text-white text-xl font-semibold rounded-xl transition-colors flex items-center justify-center gap-3"
              >
                Continue to Research
                <ArrowRight className="w-6 h-6" />
              </button>
              <button
                onClick={handleStartOver}
                className="py-5 px-8 bg-slate-100 hover:bg-slate-200 text-slate-700 text-lg font-medium rounded-xl transition-colors"
              >
                Start Over
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
