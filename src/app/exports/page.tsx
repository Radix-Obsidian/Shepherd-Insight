'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/onboarding/PageHeader'
import { buildMarkdown, downloadFile } from '@/lib/export'
import { useAppStore, useProjects, useDraftVersionData } from '@/lib/store'

function ExportsPageContent() {
  const searchParams = useSearchParams()
  const projectId = searchParams.get('projectId')
  const versionId = searchParams.get('versionId')

  const projects = useProjects()
  const draftData = useDraftVersionData()

  // Get version data from URL params or fall back to draft
  const currentVersion = projectId && versionId 
    ? useAppStore.getState().getProjectVersion(projectId, versionId)
    : null

  const versionData = currentVersion || draftData

  if (!versionData) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Export Your Insight Brief"
          description="Download something you can send to designers, devs, and investors."
        />
        <Card className="text-center py-12">
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">No data to export</h3>
            <p className="text-muted-foreground mb-4">
              Create a project first to export your insight brief.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleMarkdownExport = () => {
    const markdown = buildMarkdown(versionData)
    const filename = `${versionData.name.replace(/\s+/g, '-').toLowerCase()}-insight.md`
    downloadFile({
      filename,
      content: markdown,
      mimeType: 'text/markdown'
    })
  }

  const handlePDFExport = () => {
    // Phase 6: Stub PDF export (downloads as text for prototype)
    const markdown = buildMarkdown(versionData)
    const filename = `${versionData.name.replace(/\s+/g, '-').toLowerCase()}-insight.pdf`
    downloadFile({
      filename,
      content: markdown,
      mimeType: 'text/plain' // Note: This is a prototype stub
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Export Your Insight Brief"
        description="Download something you can send to designers, devs, and investors."
      />

      {/* Export Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Markdown Export Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📝</span>
              Markdown Export
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Download your insight brief as a Markdown file. Perfect for GitHub, Notion, or any Markdown editor.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✓ Full project details</li>
              <li>✓ MVP features and constraints</li>
              <li>✓ Positioning and personas</li>
              <li>✓ Easy to read and edit</li>
            </ul>
            <Button 
              onClick={handleMarkdownExport}
              className="w-full"
              size="lg"
              data-testid="export-markdown"
            >
              Download as Markdown (.md)
            </Button>
          </CardContent>
        </Card>

        {/* PDF Export Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📄</span>
              PDF Export
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Download your insight brief as a PDF. Perfect for sharing with investors, contractors, or your team.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✓ Professional formatting</li>
              <li>✓ Ready to share</li>
              <li>✓ All project details included</li>
              <li>⚠️ Prototype: Text format</li>
            </ul>
            <Button 
              onClick={handlePDFExport}
              className="w-full"
              size="lg"
              variant="outline"
            >
              Download as PDF (.pdf)
            </Button>
            <p className="text-xs text-muted-foreground italic">
              Note: PDF generation will be enhanced in a future update with proper server-side rendering.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Export Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div><strong>Project:</strong> {versionData.name}</div>
            <div><strong>Version:</strong> {versionData.version_number || 1}</div>
            <div><strong>Timestamp:</strong> {versionData.created_at ? new Date(versionData.created_at).toLocaleString() : new Date().toLocaleString()}</div>
            <div><strong>Sections:</strong> Problem Summary, Target Persona, Pain Points, MVP Features, Out of Scope, Constraints, Positioning Line, Mind Map Reference</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ExportsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ExportsPageContent />
    </Suspense>
  )
}
