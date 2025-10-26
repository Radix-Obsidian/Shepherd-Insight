'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/onboarding/PageHeader'
import {
  useProjects,
  useDraftVersionData,
  useIsAuthenticated,
  useError,
  useAuthReady
} from '@/lib/store'

function VaultPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams.get('projectId')
  const versionId = searchParams.get('versionId')

  const projects = useProjects()
  const draftData = useDraftVersionData()
  const isAuthenticated = useIsAuthenticated()
  const authReady = useAuthReady()
  const error = useError()

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projectId || null)
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(versionId || null)
  const hasRedirected = useRef(false)

  // Redirect to account if not authenticated (only on initial load)
  useEffect(() => {
    if (authReady && !isAuthenticated && !hasRedirected.current) {
      hasRedirected.current = true
      router.push('/account')
    }
  }, [authReady, isAuthenticated, router])

  // Set initial selection from URL params
  useEffect(() => {
    if (projectId) setSelectedProjectId(projectId)
    if (versionId) setSelectedVersionId(versionId)
  }, [projectId, versionId])

  // Find selected project and version
  const selectedProject = selectedProjectId ? projects.find(p => p.id === selectedProjectId) : null
  const selectedVersion = selectedVersionId ?
    selectedProject?.versions?.find(v => v.id === selectedVersionId) :
    selectedProject?.versions?.[selectedProject.versions.length - 1]

  // Use version data if available, otherwise fall back to draft
  const vaultData = selectedVersion ? {
    name: selectedVersion.name,
    must_haves: selectedVersion.must_haves || [],
    not_now: selectedVersion.not_now || [],
    constraints: selectedVersion.constraints,
    version_number: selectedVersion.version_number,
    created_at: selectedVersion.created_at,
  } : draftData ? {
    name: draftData.name,
    must_haves: draftData.must_haves || [],
    not_now: draftData.not_now || [],
    constraints: draftData.constraints,
    version_number: 1,
    created_at: new Date().toISOString(),
  } : null

  // Show loading while checking authentication
  if (!authReady) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect via useEffect
  }

  // Empty state
  if (!vaultData) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Decision Vault"
          description="Your source of truth. This is what we're doing now, and what we're not touching yet."
        />

        <Card className="text-center py-12">
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">No locked decisions yet</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Go lock them from the Insight page or create a new project to get started.
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => router.push('/insight')}>
                Go to Insight
              </Button>
              <Button variant="outline" onClick={() => router.push('/intake')}>
                Create New Project
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Decision Vault"
        description="Your source of truth. This is what we're doing now, and what we're not touching yet."
      />

      {/* Project/Version Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Project & Version</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Project Selector */}
            <div>
              <label className="block text-sm font-medium mb-2">Project</label>
              <select
                value={selectedProjectId || ''}
                onChange={(e) => {
                  setSelectedProjectId(e.target.value || null)
                  setSelectedVersionId(null) // Reset version when project changes
                }}
                className="w-full p-2 border border-input rounded-md bg-background"
              >
                <option value="">Select a project...</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Version Selector */}
            <div>
              <label className="block text-sm font-medium mb-2">Version</label>
              <select
                value={selectedVersionId || ''}
                onChange={(e) => setSelectedVersionId(e.target.value || null)}
                className="w-full p-2 border border-input rounded-md bg-background"
                disabled={!selectedProjectId}
              >
                <option value="">Select a version...</option>
                {selectedProject?.versions?.map((version) => (
                  <option key={version.id} value={version.id}>
                    v{version.version_number} - {version.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedProject && (
            <div className="mt-4 p-3 bg-muted/50 rounded">
              <p className="text-sm text-muted-foreground">
                <strong>Current:</strong> {selectedProject.name}
                {selectedVersion && ` → v${selectedVersion.version_number}`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MVP Must-Haves (Locked) */}
      <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
        <CardHeader>
          <CardTitle className="text-green-800 dark:text-green-200">
            MVP Must-Haves (Locked)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vaultData.must_haves.length > 0 ? (
            <div className="space-y-3">
              {vaultData.must_haves.map((feature: string, index: number) => (
                <div key={index} className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-green-900 dark:text-green-100">
                        {feature}
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        Critical for first release
                      </p>
                    </div>
                    <Badge variant="default" className="ml-2">
                      Locked for v{vaultData.version_number}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-green-700 dark:text-green-300">
                No features locked yet. Use the "Lock Decisions" button in the Insight page to define your MVP scope.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Not Building Yet */}
      <Card className="border-gray-300">
        <CardHeader>
          <CardTitle className="text-gray-800 dark:text-gray-200">
            Not Building Yet
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vaultData.not_now.length > 0 ? (
            <div className="space-y-3">
              {vaultData.not_now.map((feature: string, index: number) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        NOT NOW – {feature}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Reason: Out of scope for MVP
                      </p>
                    </div>
                    <Badge variant="warning" className="ml-2">
                      Out of scope
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                No features marked as out of scope. This is normal for early-stage projects.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Constraints / Risks */}
      <Card className="border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20">
        <CardHeader>
          <CardTitle className="text-yellow-800 dark:text-yellow-200">
            ⚠ Constraints / Risks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vaultData.constraints ? (
            <div className="space-y-3">
              {vaultData.constraints.split('\n').filter(Boolean).map((constraint: string, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-yellow-200">
                  <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">⚠</span>
                  <p className="text-yellow-900 dark:text-yellow-100 flex-1">
                    {constraint}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-yellow-700 dark:text-yellow-300">
                No constraints documented yet. Consider adding timeline, budget, or technical limitations.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Version Info */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Vault derived from Version v{vaultData.version_number} — {new Date(vaultData.created_at).toLocaleString()}
          </p>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => router.push('/exports')} className="flex-1">
          Export Brief + Vault
        </Button>
        <Button variant="outline" onClick={() => router.push('/insight')} className="flex-1">
          Back to Insight Report
        </Button>
      </div>
    </div>
  )
}

export default function VaultPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VaultPageContent />
    </Suspense>
  )
}
