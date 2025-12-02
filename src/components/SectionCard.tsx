import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SectionCardProps {
  title: string
  children: React.ReactNode
  variant?: 'default' | 'highlight' | 'subtle'
  className?: string
}

export function SectionCard({ 
  title, 
  children, 
  variant = 'default', 
  className 
}: SectionCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border p-6',
        {
          'bg-card text-card-foreground shadow-sm': variant === 'default',
          'bg-primary/5 border-primary/20 text-foreground shadow-md': variant === 'highlight',
          'bg-muted/30 border-muted text-muted-foreground': variant === 'subtle',
        },
        className
      )}
    >
      <h3 className="text-lg font-semibold mb-4 text-foreground">{title}</h3>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  )
}
