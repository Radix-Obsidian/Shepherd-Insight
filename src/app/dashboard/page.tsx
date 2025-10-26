'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/onboarding/PageHeader'
import { ProductTour } from '@/components/onboarding/ProductTour'
import { HelpDrawer } from '@/components/onboarding/HelpDrawer'
import { ResearchPanel } from '@/components/research/ResearchPanel'
import {
  useProjects,
  useIsAuthenticated,
  useSyncInProgress,
  useError,
  useUser,
  useAppStore,
  useAuthReady
} from '@/lib/store'
import { NEXT_PUBLIC_DISABLE_AUTH } from '@/lib/env'

export default function DashboardPage() {
  const router = useRouter()
  const projects = useProjects()
  const isAuthenticated = useIsAuthenticated()
  const authReady = useAuthReady()
  const syncInProgress = useSyncInProgress()
  const error = useError()
  const user = useUser()
  const [isHelpDrawerOpen, setIsHelpDrawerOpen] = useState(false)
  const [isResearchPanelOpen, setIsResearchPanelOpen] = useState(false)

  // Redirect to account if not authenticated (only on initial load)
  useEffect(() => {
    // Skip auth check if disabled (DEV ONLY)
    if (NEXT_PUBLIC_DISABLE_AUTH) return
    
    if (authReady && !isAuthenticated) {
      router.push('/account')
    }
  }, [authReady, isAuthenticated, router])

  // Sync projects on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      useAppStore.getState().syncProjects()
    }
  }, [isAuthenticated])

  const hasProjects = projects.length > 0

  // Show loading state while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Checking authentication...</p>
          </div>
        </div>
      </div>
    )
  }

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
          description={`Welcome back${user?.email ? `, ${user.email}` : ''}! Each project is something you're shaping. Click one to keep refining it.`}
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

        {/* Error Display */}
        {error && (
          <div className="rounded-lg border-red-200 bg-red-50 dark:bg-red-900/20 p-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {syncInProgress && (
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              <span className="animate-spin inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full mr-2"></span>
              Syncing your projects...
            </p>
          </div>
        )}

        {/* AI Research Assistant */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🧠</span>
              AI Research Assistant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Let AI research your market, analyze competitors, and generate insights automatically.
            </p>
            <Button onClick={() => setIsResearchPanelOpen(true)}>
              Start New Research
            </Button>
          </CardContent>
        </Card>

        {/* Content: Projects Grid or Empty State */}
        {hasProjects ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              // Get the latest version for display
              const latestVersion = project.versions?.[project.versions.length - 1]
              const hasLockedDecisions = latestVersion?.locked_decisions?.mustHavesLocked?.length > 0

              return (
                <Card key={project.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      {hasLockedDecisions ? (
                        <Badge variant="default">Decisions Locked</Badge>
                      ) : latestVersion ? (
                        <Badge variant="warning">In Progress</Badge>
                      ) : (
                        <Badge variant="warning">No versions yet</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {latestVersion?.problem || 'Project description coming soon...'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {latestVersion ?
                        `v${latestVersion.version_number} — ${new Date(latestVersion.created_at).toLocaleDateString()}` :
                        `Created ${new Date(project.created_at).toLocaleDateString()}`
                      }
                    </p>
                    <div className="flex gap-2">
                      <Link href={`/insight?projectId=${project.id}${latestVersion ? `&versionId=${latestVersion.id}` : ''}`} className="flex-1">
                        <Button variant="primary" size="sm" className="w-full">
                          Open Insight
                        </Button>
                      </Link>
                      <Link href={`/vault?projectId=${project.id}${latestVersion ? `&versionId=${latestVersion.id}` : ''}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          View Vault
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
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

        {/* Research Panel */}
        <ResearchPanel 
          isOpen={isResearchPanelOpen}
          onClose={() => setIsResearchPanelOpen(false)}
          onComplete={(data) => {
            console.log('Research completed:', data)
            // TODO: Navigate to mind map with generated data
          }}
        />

        {/* Help Drawer */}
        <HelpDrawer 
          isOpen={isHelpDrawerOpen}
          onClose={() => setIsHelpDrawerOpen(false)}
        />

        {/* Product Tour */}
        <ProductTour />
      </div>
    </div>
  )
}