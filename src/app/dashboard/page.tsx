'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/onboarding/PageHeader'
import { ProductTour } from '@/components/onboarding/ProductTour'
import { HelpDrawer } from '@/components/onboarding/HelpDrawer'
import { useProjects, useHasSeenOnboarding } from '@/lib/store'

const mockProjects = [
  {
    id: "p1",
    name: "CashPilot",
    summary: "Automated cashflow tracking for solo operators.",
    latestVersion: "v2 — Updated Oct 24, 2025",
    needsDecisionsLocked: true,
  },
  {
    id: "p2",
    name: "ChairPro",
    summary: "No-show prevention + auto rebooking for barbers/salon owners.",
    latestVersion: "v1 — Updated Oct 22, 2025",
    needsDecisionsLocked: false,
  }
]

export default function DashboardPage() {
  const projects = useProjects()
  const [isHelpDrawerOpen, setIsHelpDrawerOpen] = useState(false)

  const hasProjects = mockProjects.length > 0

  return (
    <div className="relative">
      <ProductTour />

      <HelpDrawer
        isOpen={isHelpDrawerOpen}
        onClose={() => setIsHelpDrawerOpen(false)}
      />

      <div className="space-y-6">
        <PageHeader
          title="Your Projects"
          description="Each project is something you're shaping. Click one to keep refining it."
          actions={
            <>
              <Button
                variant="ghost"
                onClick={() => setIsHelpDrawerOpen(true)}
                aria-label="Help"
              >
                ?
              </Button>
              <Link href="/intake">
                <Button size="lg">
                  + Start a New Idea
                </Button>
              </Link>
            </>
          }
        />

        {/* Helper Text */}
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">
            <strong>New to product development?</strong> Start with "Start a New Idea" to define your product concept.
            We'll help you structure your thinking and identify what matters most for your target audience.
          </p>
        </div>

        {/* Content: Projects Grid or Empty State */}
        {hasProjects ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    {project.needsDecisionsLocked && (
                      <Badge variant="warning">Needs decisions locked</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.summary}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {project.latestVersion}
                  </p>
                  <div className="flex gap-2">
                    <Link href={`/insight?projectId=${project.id}&versionId=v2`} className="flex-1">
                      <Button variant="primary" size="sm" className="w-full">
                        Open Insight
                      </Button>
                    </Link>
                    <Link href={`/vault?projectId=${project.id}&versionId=v2`} className="flex-1">
                      <Button variant="secondary" size="sm" className="w-full">
                        View Vault
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="text-lg font-semibold mb-2">Let's start your first idea.</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                You'll answer a few questions, and we'll turn it into a founder brief you can send to a contractor today.
              </p>
              <Link href="/intake">
                <Button>Start now</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}