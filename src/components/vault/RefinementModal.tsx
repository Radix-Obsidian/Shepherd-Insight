'use client'

import { useState } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Sparkles } from 'lucide-react'

interface RefinementModalProps {
  decision: Decision | null
  isOpen: boolean
  onClose: () => void
  onRefine: (userRequest: string) => Promise<void>
}

export function RefinementModal({
  decision,
  isOpen,
  onClose,
  onRefine,
}: RefinementModalProps) {
  const [userRequest, setUserRequest] = useState('')
  const [isRefining, setIsRefining] = useState(false)

  const handleSubmit = async () => {
    if (!userRequest.trim()) return

    setIsRefining(true)
    try {
      await onRefine(userRequest)
      setUserRequest('')
      onClose()
    } catch (error) {
      console.error('Refinement failed:', error)
    } finally {
      setIsRefining(false)
    }
  }

  if (!decision) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Refine This Decision
          </DialogTitle>
          <DialogDescription>
            Tell us how you&apos;d like to improve this decision. Our AI will refine it while keeping the original structure.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Content Preview */}
          <div className="p-4 bg-slate-50 rounded-lg border">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Current Version:</h4>
            <div className="text-sm text-slate-600">
              <pre className="whitespace-pre-wrap font-mono text-xs">
                {JSON.stringify(decision.content, null, 2)}
              </pre>
            </div>
          </div>

          {/* User Request Input */}
          <div className="space-y-2">
            <label htmlFor="refinement-request" className="text-sm font-medium text-slate-700">
              How should we refine this?
            </label>
            <Textarea
              id="refinement-request"
              placeholder="E.g., 'Make this persona more technical', 'Add more specific pain points', 'Focus on mobile users'"
              value={userRequest}
              onChange={(e) => setUserRequest(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-slate-500">
              Be specific about what you want to change. The AI will maintain the structure and enhance the details.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isRefining}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!userRequest.trim() || isRefining}
            className="gap-2"
          >
            {isRefining ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Refining...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Refine with AI
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
