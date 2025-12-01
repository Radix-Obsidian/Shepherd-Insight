'use client'

import { useState, useEffect } from 'react'
import { Decision } from '@/types/project'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, RefreshCw, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AlternativesModalProps {
  decision: Decision | null
  isOpen: boolean
  onClose: () => void
  onReplace: (newContent: any) => Promise<void>
}

export function AlternativesModal({
  decision,
  isOpen,
  onClose,
  onReplace,
}: AlternativesModalProps) {
  const [alternatives, setAlternatives] = useState<any[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isReplacing, setIsReplacing] = useState(false)

  useEffect(() => {
    if (isOpen && decision) {
      generateAlternatives()
    } else {
      setAlternatives([])
      setSelectedIndex(null)
    }
  }, [isOpen, decision])

  const generateAlternatives = async () => {
    if (!decision) return

    setIsGenerating(true)
    try {
      const response = await fetch('/api/vault/alternatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decisionType: decision.type,
          currentContent: decision.content,
        }),
      })

      const result = await response.json()
      if (result.success && result.data?.alternatives) {
        setAlternatives(result.data.alternatives)
      } else {
        throw new Error(result.error || 'Failed to generate alternatives')
      }
    } catch (error) {
      console.error('Failed to generate alternatives:', error)
      setAlternatives([])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleReplace = async () => {
    if (selectedIndex === null || !alternatives[selectedIndex]) return

    setIsReplacing(true)
    try {
      await onReplace(alternatives[selectedIndex])
      onClose()
    } catch (error) {
      console.error('Replace failed:', error)
    } finally {
      setIsReplacing(false)
    }
  }

  if (!decision) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-indigo-600" />
            Alternative Options
          </DialogTitle>
          <DialogDescription>
            Choose a different direction for this decision. Select one to replace the current version.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Content */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Current:</h4>
            <Card className="border-slate-200">
              <CardContent className="p-4">
                <pre className="whitespace-pre-wrap font-mono text-xs text-slate-600">
                  {JSON.stringify(decision.content, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>

          {/* Alternatives */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-slate-700">
                Alternatives:
              </h4>
              <Button
                size="sm"
                variant="ghost"
                onClick={generateAlternatives}
                disabled={isGenerating}
                className="gap-1 text-xs"
              >
                <RefreshCw className={cn("w-3 h-3", isGenerating && "animate-spin")} />
                Regenerate
              </Button>
            </div>

            {isGenerating ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <span className="ml-3 text-slate-600">Generating alternatives...</span>
              </div>
            ) : alternatives.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No alternatives generated. Try again.
              </div>
            ) : (
              <div className="space-y-3">
                {alternatives.map((alt, index) => (
                  <Card
                    key={index}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      selectedIndex === index
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-slate-200"
                    )}
                    onClick={() => setSelectedIndex(index)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                          selectedIndex === index
                            ? "border-indigo-500 bg-indigo-500"
                            : "border-slate-300"
                        )}>
                          {selectedIndex === index && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-slate-500 mb-1">
                            Option {index + 1}
                          </div>
                          <pre className="whitespace-pre-wrap font-mono text-xs text-slate-700">
                            {JSON.stringify(alt, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isReplacing}>
            Cancel
          </Button>
          <Button
            onClick={handleReplace}
            disabled={selectedIndex === null || isReplacing}
            className="gap-2"
          >
            {isReplacing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Replacing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Replace with Selected
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
