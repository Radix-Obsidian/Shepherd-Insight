import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TourSpotlightProps {
  targetElement: HTMLElement | null
  className?: string
}

export function TourSpotlight({ targetElement, className }: TourSpotlightProps) {
  const [spotlightStyle, setSpotlightStyle] = React.useState<React.CSSProperties>({})

  React.useEffect(() => {
    if (!targetElement) {
      setSpotlightStyle({})
      return
    }

    const updateSpotlight = () => {
      const rect = targetElement.getBoundingClientRect()
      const padding = 8 // Extra padding around the element

      setSpotlightStyle({
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 40,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        clipPath: `polygon(
          0% 0%,
          0% 100%,
          ${rect.left - padding}px 100%,
          ${rect.left - padding}px ${rect.top - padding}px,
          ${rect.right + padding}px ${rect.top - padding}px,
          ${rect.right + padding}px ${rect.bottom + padding}px,
          ${rect.left - padding}px ${rect.bottom + padding}px,
          ${rect.left - padding}px 100%,
          100% 100%,
          100% 0%
        )`,
        transition: 'opacity 300ms ease-in-out',
      })
    }

    updateSpotlight()

    // Update on scroll/resize
    const handleUpdate = () => updateSpotlight()
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
    <div
      className={cn(
        'fixed inset-0 bg-black/80 transition-opacity duration-300',
        className
      )}
      style={spotlightStyle}
    />
  )
}
