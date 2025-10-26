'use client'

import * as React from 'react'
import Link from 'next/link'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { SectionCard } from '@/components/SectionCard'
import { LockDecisionsModal } from '@/components/LockDecisionsModal'
import {
  useDraftVersionData,
  useProjects,
  useIsAuthenticated,
  useError,
  useAppStore
} from '@/lib/store'

const tabs = [
  { name: 'Insight', href: '/insight', active: true },
  { name: 'Vault', href: '/vault' },
  { name: 'Mind Map', href: '/mindmap' },
  { name: 'Export', href: '/exports' },
]

function InsightPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const projectId = searchParams.get('projectId')
  const versionId = searchParams.get('versionId')

  const draftData = useDraftVersionData()
  const projects = useProjects()
  const isAuthenticated = useIsAuthenticated()
  const error = useError()
  const [isLockModalOpen, setIsLockModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Phase 7: Version management functions
  const handleVersionChange = (newVersionId: string) => {
    if (projectId) {
      router.push(`/insight?projectId=${projectId}&versionId=${newVersionId}`)
    }
  }

  const handleCreateNewVersion = () => {
    if (projectId && versionId) {
      const { newVersionId } = useAppStore.getState().cloneVersion(projectId, versionId)
      router.push(`/insight?projectId=${projectId}&versionId=${newVersionId}`)
    }
  }

  // Find project data if projectId is provided
  const currentProject = projectId ? projects.find(p => p.id === projectId) : null
  const currentVersion = currentProject?.versions?.find(v => versionId ? v.id === versionId : true) ||
                        currentProject?.versions?.[currentProject.versions.length - 1]

  // Use version data if available, otherwise fall back to draft
  const insightData = currentVersion ? {
    name: currentVersion.name,
    audience: currentVersion.audience,
    problem: currentVersion.problem,
    why_current_fails: currentVersion.why_current_fails,
    promise: currentVersion.promise,
    must_haves: currentVersion.must_haves,
    not_now: currentVersion.not_now,
    constraints: currentVersion.constraints,
  } : draftData

  // Redirect to account if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/account'
    }
  }, [isAuthenticated])

  // Empty state if no data available
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Please sign in to continue...</p>
        </div>
      </div>
    )
  }

  if (!insightData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Insight Report</h1>
          <p className="text-muted-foreground mt-2">
            Your structured analysis will appear here.
          </p>
        </div>

        <Card className="text-center py-12">
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">No project data found</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              {projectId ?
                'This project doesn\'t have any versions yet.' :
                'Start by creating a new idea to generate your insight report.'
              }
            </p>
            <Link href="/intake">
              <Button>Go to Intake</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Synthesize pain points from the data
  const painPoints = [
    `Loses time doing ${insightData.problem.toLowerCase()} manually`,
    `Struggles with ${insightData.why_current_fails.toLowerCase()}`,
    `Can't focus on growth because of ${insightData.problem.toLowerCase()}`
  ]

  // Generate competitive insights from why_current_fails
  const competitiveInsights = [
    `Current tools assume ${insightData.why_current_fails.toLowerCase()}`,
    `Setup is confusing if you're not technical`,
    `Existing solutions don't understand ${insightData.audience.toLowerCase()} needs`
  ]

  // Create positioning sentence
  const positioningSentence = `We help ${insightData.audience} solve ${insightData.problem.toLowerCase()} without ${insightData.why_current_fails.toLowerCase()}, by ${insightData.promise.toLowerCase()}.`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight" data-testid="insight-title">
              {insightData.name || 'Untitled Project'}
            </h1>
            {currentVersion && (
              <Badge variant="default">v{currentVersion.version_number}</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {currentVersion ?
              `Version ${currentVersion.version_number} — ${new Date(currentVersion.created_at).toLocaleString()}` :
              `Draft — ${new Date().toLocaleString()}`
            }
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Phase 7: Version Dropdown */}
          {currentProject && currentProject.versions.length > 0 && (
            <select
              value={versionId || currentVersion?.id || ''}
              onChange={(e) => handleVersionChange(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm bg-background"
            >
              {currentProject.versions.map((v) => (
                <option key={v.id} value={v.id}>
                  Version {v.version_number} ({new Date(v.created_at).toLocaleDateString()})
                </option>
              ))}
            </select>
          )}
          
          {/* Phase 7: Create New Version Button */}
          {projectId && versionId && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCreateNewVersion}
            >
              Create New Version
            </Button>
          )}
        </div>
      </div>

      {/* Helper text */}
      <p className="text-sm text-muted-foreground">
        This is your structured insight. We'll clean the chaos and show you what matters first.
      </p>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            // Phase 7: Maintain URL params across tab navigation
            const tabHref = projectId && versionId 
              ? `${tab.href}?projectId=${projectId}&versionId=${versionId}`
              : tab.href
            return (
            <Link
              key={tab.name}
              href={tabHref}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                tab.active
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
              }`}
            >
              {tab.name}
            </Link>
            )
          })}
        </nav>
      </div>

      {/* Content Sections */}
      <div className="space-y-6">
        {/* Problem Summary */}
        <SectionCard title="Problem Summary">
          <div className="space-y-3">
            <p className="text-sm leading-relaxed">
              {insightData.problem}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {insightData.why_current_fails}
            </p>
          </div>
        </SectionCard>

        {/* Target Persona */}
        <SectionCard title="Who This Is For">
          <div className="space-y-2">
            <h4 className="font-medium text-primary">{insightData.audience}</h4>
            <ul className="space-y-1 text-sm">
              <li>• <strong>Daily reality:</strong> {insightData.constraints || 'Managing complex workflows manually'}</li>
              <li>• <strong>What they're trying to do:</strong> {insightData.problem.toLowerCase()}</li>
              <li>• <strong>Why they're frustrated:</strong> {insightData.why_current_fails.toLowerCase()}</li>
            </ul>
          </div>
        </SectionCard>

        {/* Top Pain Points */}
        <SectionCard title="Top Pain Points">
          <ul className="space-y-2 text-sm">
            {painPoints.map((point, index) => (
              <li key={index} className="flex items-start">
                <span className="text-destructive mr-2">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* MVP Feature Set */}
        <SectionCard title="MVP Feature Set">
          <div className="space-y-3">
            {insightData.must_haves.map((feature: string, index: number) => (
              <div key={index} className="border-l-2 border-primary pl-3">
                <div className="font-medium text-sm">{feature}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Why it matters: Core functionality that solves the primary problem
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Out of Scope */}
        <SectionCard title="Out of Scope">
          <ul className="space-y-2 text-sm">
            {insightData.not_now.map((feature: string, index: number) => (
              <li key={index} className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                <span><strong>NOT NOW –</strong> {feature}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* Competitive Snapshot */}
        <SectionCard title="Competitive Snapshot" variant="subtle">
          <ul className="space-y-2 text-sm">
            {competitiveInsights.map((insight, index) => (
              <li key={index} className="flex items-start">
                <span className="text-muted-foreground mr-2">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* Positioning Sentence */}
        <SectionCard title="Positioning" variant="highlight">
          <p className="text-lg font-medium leading-relaxed">
            {positioningSentence}
          </p>
        </SectionCard>
      </div>

      {/* Bottom Action */}
      <div className="flex justify-center pt-6">
        <Button size="lg" onClick={() => setIsLockModalOpen(true)}>
          Lock Decisions
        </Button>
      </div>

      {/* Lock Decisions Modal */}
      <LockDecisionsModal
        isOpen={isLockModalOpen}
        onClose={() => setIsLockModalOpen(false)}
        mustHaves={insightData.must_haves}
        notNow={insightData.not_now}
      />
    </div>
  )
}

export default function InsightPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InsightPageContent />
    </Suspense>
  )
}