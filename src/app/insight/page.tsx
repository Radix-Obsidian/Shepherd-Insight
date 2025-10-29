'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SectionCard } from '@/components/SectionCard';
import { LockDecisionsModal } from '@/components/LockDecisionsModal';
import { InsightHeader } from './InsightHeader';
import type { LockedDecisions } from '@/types/project';

const tabs = [
  { label: 'Insight', href: '/insight' },
  { label: 'Vault', href: '/vault' },
  { label: 'Mind Map', href: '/mindmap' },
  { label: 'Export', href: '/exports' },
];

interface VersionData {
  id: string;
  version_number: number;
  name: string;
  audience: string;
  problem: string;
  why_current_fails: string;
  promise: string;
  must_haves: string[];
  not_now: string[];
  constraints: string;
  locked_decisions: {
    mustHavesLocked?: string[];
    notNowLocked?: string[];
  };
}

interface ProjectData {
  id: string;
  name: string;
  created_at: string;
  versions: VersionData[];
}

interface InsightData {
  pain_points?: Array<{ description: string; severity: string }>;
  competitors?: Array<{ name: string; weaknesses: string[] }>;
  personas?: Array<{ name: string; description: string; pain_points: string[] }>;
  MVP_features?: string[];
  out_of_scope?: string[];
}

function InsightPageContent() {
  const params = useSearchParams();
  const projectId = params.get('projectId') || '';
  const versionId = params.get('versionId') || '';
  
  const [project, setProject] = React.useState<ProjectData | null>(null);
  const [insight, setInsight] = React.useState<InsightData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isLockModalOpen, setIsLockModalOpen] = React.useState(false);

  // Load project and version data
  React.useEffect(() => {
    if (!projectId || !versionId) {
      setIsLoading(false);
      return;
    }

    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);

        // Load project and version
        const projectResponse = await fetch(`/api/supabase?action=project&projectId=${projectId}`);
        if (!projectResponse.ok) {
          throw new Error('Failed to load project');
        }
        const { project: projectData } = await projectResponse.json();
        setProject(projectData);

        // Find the specific version
        const version = projectData.versions?.find((v: VersionData) => v.id === versionId);
        if (!version) {
          throw new Error('Version not found');
        }

        // Try to load insight data
        try {
          const insightResponse = await fetch(`/api/research/run?insightJobId=${projectId}`);
          if (insightResponse.ok) {
            const insightData = await insightResponse.json();
            if (insightData.insight) {
              setInsight(insightData.insight);
            }
          }
        } catch (insightError) {
          // Insight not ready yet, that's okay
          console.log('Insight not yet available');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load data';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [projectId, versionId]);

  // Handle lock decisions
  async function handleSaveLocked(nextLock: { mustHavesLocked: string[]; notNowLocked: string[] }) {
    if (!versionId) return;

    try {
      const response = await fetch('/api/supabase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-version',
          versionId,
          updates: {
            locked_decisions: nextLock,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save locked decisions');
      }

      // Reload project data
      if (projectId) {
        const projectResponse = await fetch(`/api/supabase?action=project&projectId=${projectId}`);
        if (projectResponse.ok) {
          const { project: projectData } = await projectResponse.json();
          setProject(projectData);
        }
      }
    } catch (err) {
      console.error('Failed to save locked decisions:', err);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Insight Report</h1>
          <p className="text-muted-foreground mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !projectId || !versionId || !project) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Insight Report</h1>
          <p className="text-muted-foreground mt-2">Select a project and version to see the structured brief.</p>
        </div>

        <Card className="text-center">
          <CardContent className="py-12">
            <h3 className="text-lg font-semibold mb-2">
              {error || 'No version selected'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {error || 'Open a project from the dashboard to generate an insight brief.'}
            </p>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const version = project.versions?.find((v: VersionData) => v.id === versionId);
  if (!version) {
    return (
      <div className="space-y-6">
        <Card className="text-center">
          <CardContent className="py-12">
            <h3 className="text-lg font-semibold mb-2">Version not found</h3>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Use insight data if available, otherwise fall back to version data
  const painPoints = insight?.pain_points?.map(p => p.description) || 
    (version.problem
      ? [
          `Loses time because ${version.problem.toLowerCase()}`,
          `Feels blocked by ${version.why_current_fails.toLowerCase() || 'status quo'}`,
          `Needs relief from ${version.problem.toLowerCase()}`,
        ]
      : ['Pain points pending — add more problem context.']);

  const mvpFeatures = insight?.MVP_features || version.must_haves || [];
  const outOfScope = insight?.out_of_scope || version.not_now || [];

  const positioning =
    `We help ${version.audience || 'users'} solve ${version.problem || 'their problem'} without ${version.why_current_fails || 'frustration'}, by ${version.promise || 'our approach'}.`;

  // Ensure locked decisions always have arrays, never undefined
  const locked: LockedDecisions = {
    mustHavesLocked: Array.isArray(version.locked_decisions?.mustHavesLocked) 
      ? version.locked_decisions.mustHavesLocked 
      : [],
    notNowLocked: Array.isArray(version.locked_decisions?.notNowLocked) 
      ? version.locked_decisions.notNowLocked 
      : [],
  };

  return (
    <div className="space-y-6">
      <InsightHeader />

      <nav className="flex gap-4 border-b pb-2 text-sm">
        {tabs.map(tab => {
          const href = `${tab.href}?projectId=${projectId}&versionId=${versionId}`;
          const isActive = tab.href === '/insight';
          return (
            <Link
              key={tab.href}
              href={href}
              className={isActive ? 'font-medium text-primary border-b-2 border-primary pb-1' : 'text-gray-600 hover:text-gray-900'}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-6">
        <SectionCard title="Problem Summary">
          <div className="space-y-3">
            <p className="text-sm leading-relaxed">{version.problem || 'Add a problem statement to craft the story.'}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {version.why_current_fails || 'Why current solutions fail goes here.'}
            </p>
          </div>
        </SectionCard>

        <SectionCard title="Target Persona">
          <div className="space-y-2">
            <h4 className="font-medium text-primary">{version.audience || 'Audience pending'}</h4>
            {insight?.personas && insight.personas.length > 0 ? (
              <div className="space-y-3">
                {insight.personas.map((persona, idx) => (
                  <div key={idx} className="text-sm">
                    <p className="font-medium">{persona.name}</p>
                    <p className="text-muted-foreground">{persona.description}</p>
                    {persona.pain_points && persona.pain_points.length > 0 && (
                      <ul className="mt-1 ml-4 list-disc">
                        {persona.pain_points.map((pain, pIdx) => (
                          <li key={pIdx}>{pain}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <ul className="space-y-1 text-sm">
                <li>• What they strive for: {version.promise || 'Define the core promise.'}</li>
                <li>• What blocks them: {version.why_current_fails || 'Share the current frustration.'}</li>
              </ul>
            )}
          </div>
        </SectionCard>

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

        <SectionCard title="MVP Feature Set">
          <div className="space-y-3">
            {mvpFeatures.length ? (
              mvpFeatures.map((feature, index) => (
                <div key={index} className="border-l-2 border-primary pl-3">
                  <div className="font-medium text-sm">{feature}</div>
                  <div className="text-xs text-muted-foreground mt-1">Critical to solve the primary pain.</div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No features locked yet.</p>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Out of Scope (Not Now)">
          <ul className="space-y-2 text-sm">
            {outOfScope.length ? (
              outOfScope.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span>{feature}</span>
                </li>
              ))
            ) : (
              <li className="text-muted-foreground text-sm">No out-of-scope items yet.</li>
            )}
          </ul>
        </SectionCard>

        {insight?.competitors && insight.competitors.length > 0 && (
          <SectionCard title="Competitor Analysis">
            <div className="space-y-3 text-sm">
              {insight.competitors.map((competitor, idx) => (
                <div key={idx}>
                  <p className="font-medium">{competitor.name}</p>
                  {competitor.weaknesses && competitor.weaknesses.length > 0 && (
                    <ul className="ml-4 mt-1 list-disc text-muted-foreground">
                      {competitor.weaknesses.map((weakness, wIdx) => (
                        <li key={wIdx}>{weakness}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        <SectionCard title="Constraints">
          <p className="text-sm leading-relaxed">
            {version.constraints || 'List timeline, budget, or technical constraints to keep everyone aligned.'}
          </p>
        </SectionCard>

        <SectionCard title="Positioning" variant="highlight">
          <p className="text-lg font-medium leading-relaxed">{positioning}</p>
        </SectionCard>
      </div>

      <div className="flex justify-center pt-6">
        <Button size="lg" onClick={() => setIsLockModalOpen(true)}>
          Lock Decisions
        </Button>
      </div>

      <LockDecisionsModal
        isOpen={isLockModalOpen}
        onClose={() => setIsLockModalOpen(false)}
        mustHaves={mvpFeatures}
        notNow={outOfScope}
        initialLocked={locked}
        onSave={handleSaveLocked}
      />
    </div>
  );
}

export default function InsightPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Insight Report</h1>
          <p className="text-muted-foreground mt-2">Loading...</p>
        </div>
      </div>
    }>
      <InsightPageContent />
    </Suspense>
  );
}
