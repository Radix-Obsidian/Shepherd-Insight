import * as React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export interface HelpDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function HelpDrawer({ isOpen, onClose }: HelpDrawerProps) {
  if (!isOpen) {
    return null
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 md:hidden"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-white border-l border-gray-200 shadow-xl">
        <div className="flex h-full flex-col p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Need help?</h2>
              <p className="text-sm text-gray-600">Here's how this actually works.</p>
            </div>

            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900">Idea Intake</h3>
                    <p className="text-sm text-gray-600">
                      You answer simple questions in plain English. We structure it.
                    </p>
                    <Link href="/intake">
                      <Button variant="outline" size="sm" className="mt-2">
                        Start your first idea
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900">Insight Report</h3>
                    <p className="text-sm text-gray-600">
                      We give you a clean summary of the real problem, who cares, and what to build first.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900">Decision Vault</h3>
                    <p className="text-sm text-gray-600">
                      This locks "do this now" and "not doing this yet" so nobody drags you off-scope.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900">Mind Map Preview</h3>
                    <p className="text-sm text-gray-600">
                      This shows how pain points connect to features, in a way you can explain to a designer in 30 seconds.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-auto space-y-4">
            <p className="text-xs text-gray-500">
              You own this. This is your source of truth.
            </p>
            <Button onClick={onClose} variant="outline" className="w-full">
              Close
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
