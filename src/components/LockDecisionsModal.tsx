'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { LockedDecisions } from '@/types/project'

export interface LockDecisionsModalProps {
  isOpen: boolean
  onClose: () => void
  mustHaves: string[]
  notNow: string[]
  initialLocked: LockedDecisions
  onSave: (locked: LockedDecisions) => void
}

export function LockDecisionsModal({ 
  isOpen, 
  onClose, 
  mustHaves, 
  notNow,
  initialLocked,
  onSave,
}: LockDecisionsModalProps) {
  const [lockedMustHaves, setLockedMustHaves] = React.useState<string[]>(initialLocked.mustHavesLocked)
  const [lockedNotNow, setLockedNotNow] = React.useState<string[]>(initialLocked.notNowLocked)

  React.useEffect(() => {
    if (isOpen) {
      setLockedMustHaves(initialLocked.mustHavesLocked)
      setLockedNotNow(initialLocked.notNowLocked)
    }
  }, [isOpen, initialLocked.mustHavesLocked, initialLocked.notNowLocked])

  const toggleMustHave = (feature: string) => {
    setLockedMustHaves(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    )
  }

  const toggleNotNow = (feature: string) => {
    setLockedNotNow(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    )
  }

  const handleLockDecisions = () => {
    onSave({
      mustHavesLocked: lockedMustHaves,
      notNowLocked: lockedNotNow,
    })
    onClose()
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">
              Lock Your Decisions
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
            <p className="text-sm text-muted-foreground">
              Select the features you want to lock in. This protects your scope and keeps you focused on what matters first.
            </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* MVP Features Section */}
          <div>
            <h3 className="text-lg font-medium mb-3 text-green-700">
              MVP Features to Lock
            </h3>
            <div className="space-y-2">
              {mustHaves.map((feature, index) => (
                <label
                  key={index}
                  className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={lockedMustHaves.includes(feature)}
                    onChange={() => toggleMustHave(feature)}
                    className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium">{feature}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Out of Scope Section */}
          <div>
            <h3 className="text-lg font-medium mb-3 text-orange-700">
              Out of Scope to Lock
            </h3>
            <div className="space-y-2">
              {notNow.map((feature, index) => (
                <label
                  key={index}
                  className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={lockedNotNow.includes(feature)}
                    onChange={() => toggleNotNow(feature)}
                    className="mt-1 h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium">NOT NOW – {feature}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleLockDecisions}>
              Lock Decisions ({lockedMustHaves.length + lockedNotNow.length} selected)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
