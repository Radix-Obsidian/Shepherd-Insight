import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface TourTooltipProps {
  targetElement: HTMLElement | null
  message: string
  step: number
  totalSteps: number
  onNext: () => void
  onSkip: () => void
  className?: string
}

export function TourTooltip({
  targetElement,
  message,
  step,
  totalSteps,
  onNext,
  onSkip,
  className,
}: TourTooltipProps) {
  const [tooltipStyle, setTooltipStyle] = React.useState<React.CSSProperties>({})

  React.useEffect(() => {
    if (!targetElement) {
      setTooltipStyle({})
      return
    }

    const updateTooltip = () => {
      const rect = targetElement.getBoundingClientRect()
      const tooltipWidth = 320
      const tooltipHeight = 200
      const padding = 16

      // Position to the right of the sidebar item
      const left = rect.right + padding
      const top = rect.top + (rect.height - tooltipHeight) / 2

      // Ensure tooltip doesn't go off screen
      const adjustedLeft = left + tooltipWidth > window.innerWidth 
        ? rect.left - tooltipWidth - padding 
        : left

      const adjustedTop = top < padding 
        ? padding 
        : top + tooltipHeight > window.innerHeight - padding
        ? window.innerHeight - tooltipHeight - padding
        : top

      setTooltipStyle({
        position: 'fixed',
        left: adjustedLeft,
        top: adjustedTop,
        zIndex: 50,
      })
    }

    updateTooltip()

    const handleUpdate = () => updateTooltip()
    window.addEventListener('scroll', handleUpdate, true)
    window.addEventListener('resize', handleUpdate)

    return () => {
      window.removeEventListener('scroll', handleUpdate, true)
      window.removeEventListener('resize', handleUpdate)
    }
  }, [targetElement])

  if (!targetElement) {
    return null
  }

  return (
    <Card
      className={cn(
        'fixed w-80 shadow-xl border-2 border-primary/20 z-50',
        className
      )}
      style={tooltipStyle}
    >
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-primary">
              {step} of {totalSteps}
            </span>
            <button
              onClick={onSkip}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Skip tour
            </button>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex justify-end">
          <Button onClick={onNext} size="sm">
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
