'use client'

import * as React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TourSpotlight } from './TourSpotlight'
import { TourTooltip } from './TourTooltip'
import { Confetti } from './Confetti'
import { useAppStore, useTourStep, useIsTourActive, useHasSeenOnboarding } from '@/lib/store'

const TOUR_STEPS = [
  {
    id: 'welcome',
    target: null,
    message: '',
    isModal: true,
  },
  {
    id: 'dashboard',
    target: '[data-tour-target="dashboard"]',
    message: "Your home base. See all your projects and track what you're building.",
  },
  {
    id: 'new-insight',
    target: '[data-tour-target="new-insight"]',
    message: "Start here. Answer questions about your idea, and we'll structure it for you.",
  },
  {
    id: 'vault',
    target: '[data-tour-target="vault"]',
    message: "Your decision vault. This locks what you're doing now vs. what can wait — so nobody scope-creeps you.",
  },
  {
    id: 'mindmap',
    target: '[data-tour-target="mindmap"]',
    message: "See how problems connect to solutions. Explain your product to anyone in 30 seconds.",
  },
  {
    id: 'exports',
    target: '[data-tour-target="exports"]',
    message: "Export everything as a clean brief you can hand to a contractor or designer today.",
  },
  {
    id: 'celebration',
    target: null,
    message: '',
    isModal: true,
  },
]

export function ProductTour() {
  const tourStep = useTourStep()
  const isTourActive = useIsTourActive()
  const hasSeenOnboarding = useHasSeenOnboarding()
  const { startTour, nextTourStep, skipTour, completeTour } = useAppStore()
  const [targetElement, setTargetElement] = React.useState<HTMLElement | null>(null)

  // Auto-start tour for new users
  React.useEffect(() => {
    if (!hasSeenOnboarding && !isTourActive) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        startTour()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [hasSeenOnboarding, isTourActive, startTour])

  // Update target element when step changes
  React.useEffect(() => {
    if (!isTourActive || tourStep < 0) {
      setTargetElement(null)
      return
    }

    const currentStep = TOUR_STEPS[tourStep]
    if (!currentStep || !currentStep.target) {
      setTargetElement(null)
      return
    }

    const element = document.querySelector(currentStep.target) as HTMLElement
    setTargetElement(element)
  }, [tourStep, isTourActive])

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isTourActive) {
        skipTour()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isTourActive, skipTour])

  // Don't render if user has completed onboarding and tour is not active
  if (hasSeenOnboarding && !isTourActive) {
    return null
  }

  const currentStep = TOUR_STEPS[tourStep]
  const isLastStep = tourStep === TOUR_STEPS.length - 1

  // Safety check - if tourStep is out of bounds or currentStep is undefined
  if (tourStep < 0 || tourStep >= TOUR_STEPS.length || !currentStep) {
    return null
  }

  // Step 0: Welcome Introduction
  if (tourStep === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 pointer-events-auto">
        <Card className="max-w-md rounded-2xl shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-semibold text-gray-900">
              Welcome to Shepherd Insight
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-center text-sm text-gray-600 leading-relaxed">
              Let's walk through how Shepherd Insight helps you turn ideas into plans you can actually ship.
            </p>

            <div className="space-y-3">
              <Button onClick={nextTourStep} className="w-full" size="lg">
                Start Tour
              </Button>
              <button
                onClick={skipTour}
                className="w-full text-sm text-muted-foreground hover:text-foreground underline"
              >
                Skip Tour
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Step 6: Completion Celebration
  if (tourStep === 6) {
    return (
      <>
        <Confetti />
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 pointer-events-auto">
          <Card className="max-w-md rounded-2xl shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-semibold text-gray-900">
                Let's get that idea baking! 🎉
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-center text-sm text-gray-600 leading-relaxed">
                You've got everything you need. Start with one idea, answer some questions, and you'll have a plan ready to ship.
              </p>

              <div className="space-y-3">
                <Link href="/intake">
                  <Button onClick={completeTour} className="w-full" size="lg">
                    Start Your First Idea
                  </Button>
                </Link>
                <button
                  onClick={skipTour}
                  className="w-full text-sm text-muted-foreground hover:text-foreground underline"
                >
                  I'll explore on my own
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  // Steps 1-5: Spotlight and Tooltip
  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="pointer-events-auto">
        <TourSpotlight targetElement={targetElement} />
        <TourTooltip
          targetElement={targetElement}
          message={currentStep.message}
          step={tourStep}
          totalSteps={TOUR_STEPS.length - 1}
          onNext={isLastStep ? completeTour : nextTourStep}
          onSkip={skipTour}
        />
      </div>
    </div>
  )
}
