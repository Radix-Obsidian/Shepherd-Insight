'use client'

/**
 * Journey Progress Component
 * 
 * Shows the user where they are in the Shepherd Journey:
 * Compass → Muse → Blueprint
 * 
 * Steve Jobs Style: Simple, clear, magical.
 */

import { Compass, BookOpen, FileText, Check } from 'lucide-react'
import Link from 'next/link'

type JourneyStep = 'compass' | 'muse' | 'blueprint'

interface JourneyProgressProps {
  currentStep: JourneyStep
  clarityId?: string | null
  researchId?: string | null
}

const steps = [
  { id: 'compass', name: 'Compass', subtitle: 'Find Clarity', icon: Compass, href: '/compass' },
  { id: 'muse', name: 'Muse', subtitle: 'Understand Deeply', icon: BookOpen, href: '/muse' },
  { id: 'blueprint', name: 'Blueprint', subtitle: 'Build With Purpose', icon: FileText, href: '/blueprint' },
] as const

export function JourneyProgress({ currentStep, clarityId, researchId }: JourneyProgressProps) {
  const currentIndex = steps.findIndex(s => s.id === currentStep)

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentIndex) return 'completed'
    if (stepIndex === currentIndex) return 'current'
    return 'upcoming'
  }

  const getStepHref = (step: typeof steps[number], stepIndex: number) => {
    if (stepIndex > currentIndex) return undefined // Can't skip ahead
    
    if (step.id === 'compass') return '/compass'
    if (step.id === 'muse' && clarityId) return `/muse?clarityId=${clarityId}`
    if (step.id === 'blueprint' && clarityId && researchId) {
      return `/blueprint?clarityId=${clarityId}&researchId=${researchId}`
    }
    return undefined
  }

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(index)
          const href = getStepHref(step, index)
          const Icon = step.icon
          const isClickable = status === 'completed' && href

          const StepContent = (
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center transition-all
                  ${status === 'completed' ? 'bg-green-500 text-white' : ''}
                  ${status === 'current' ? 'bg-amber-500 text-white ring-4 ring-amber-200' : ''}
                  ${status === 'upcoming' ? 'bg-slate-200 text-slate-400' : ''}
                  ${isClickable ? 'cursor-pointer hover:ring-2 hover:ring-green-300' : ''}
                `}
              >
                {status === 'completed' ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <Icon className="w-6 h-6" />
                )}
              </div>
              <div className="mt-2 text-center">
                <p className={`text-sm font-semibold ${status === 'current' ? 'text-amber-600' : status === 'completed' ? 'text-green-600' : 'text-slate-400'}`}>
                  {step.name}
                </p>
                <p className={`text-xs ${status === 'upcoming' ? 'text-slate-300' : 'text-slate-500'}`}>
                  {step.subtitle}
                </p>
              </div>
            </div>
          )

          return (
            <div key={step.id} className="flex items-center">
              {isClickable && href ? (
                <Link href={href}>
                  {StepContent}
                </Link>
              ) : (
                StepContent
              )}
              
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div 
                  className={`w-16 sm:w-24 h-1 mx-2 rounded ${
                    index < currentIndex ? 'bg-green-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Compact version for sidebars
 */
export function JourneyProgressCompact({ currentStep }: { currentStep: JourneyStep }) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-lg">
      {steps.map((step, index) => {
        const currentIndex = steps.findIndex(s => s.id === currentStep)
        const status = index < currentIndex ? 'completed' : index === currentIndex ? 'current' : 'upcoming'
        const Icon = step.icon

        return (
          <div key={step.id} className="flex items-center">
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center
                ${status === 'completed' ? 'bg-green-500 text-white' : ''}
                ${status === 'current' ? 'bg-amber-500 text-white' : ''}
                ${status === 'upcoming' ? 'bg-slate-200 text-slate-400' : ''}
              `}
            >
              {status === 'completed' ? (
                <Check className="w-4 h-4" />
              ) : (
                <Icon className="w-4 h-4" />
              )}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-4 h-0.5 ${index < currentIndex ? 'bg-green-500' : 'bg-slate-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
