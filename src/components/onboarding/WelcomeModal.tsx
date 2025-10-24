import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore, useHasSeenOnboarding } from '@/lib/store'

export function WelcomeModal() {
  const hasSeenOnboarding = useHasSeenOnboarding()
  const { startTour, skipTour } = useAppStore()

  if (hasSeenOnboarding) {
    return null
  }

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
            <Button onClick={startTour} className="w-full" size="lg">
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
