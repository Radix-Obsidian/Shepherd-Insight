'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SectionCard } from '@/components/SectionCard';
import { LockDecisionsModal } from '@/components/LockDecisionsModal';
import { useAppStore } from '@/lib/store';
import { InsightHeader } from './InsightHeader';

const tabs = [
  { label: 'Insight', href: '/insight' },
  { label: 'Vault', href: '/vault' },
  { label: 'Mind Map', href: '/mindmap' },
  { label: 'Export', href: '/exports' },
];

function InsightPageContent() {
  const params = useSearchParams();
  const projectId = params.get('projectId') || '';
  const versionId = params.get('versionId') || '';
  const version = useAppStore(state =>
    projectId && versionId ? state.getProjectVersion(projectId, versionId) : undefined
  );
  const lockDecisions = useAppStore(s => s.lockDecisions);
  const [isLockModalOpen, setIsLockModalOpen] = React.useState(false);

  if (!projectId || !versionId || !version) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Insight Report</h1>
          <p className="text-muted-foreground mt-2">Select a project and version to see the structured brief.</p>
        </div>

        <Card className="text-center">
          <CardContent className="py-12">
            <h3 className="text-lg font-semibold mb-2">No version selected</h3>
            <p className="text-muted-foreground mb-4">
              Open a project from the dashboard to generate an insight brief.
            </p>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const data = version.data;
  const locked = version.locked;

  const painPoints = data.problem
    ? [
        `Loses time because ${data.problem.toLowerCase()}`,
        `Feels blocked by ${data.whyCurrentFails.toLowerCase() || 'status quo'}`,
        `Needs relief from ${data.problem.toLowerCase()}`,
      ]
    : ['Pain points pending — add more problem context.'];

  const positioning =
    data.positioning ||
    `We help ${data.audience || 'users'} solve ${data.problem || 'their problem'} without ${data.whyCurrentFails || 'frustration'}, by ${data.promise || 'our approach'}.`;

  function handleSaveLocked(nextLock: typeof locked) {
    lockDecisions(projectId, versionId, nextLock);
  }

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
            <p className="text-sm leading-relaxed">{data.problem || 'Add a problem statement to craft the story.'}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {data.whyCurrentFails || 'Why current solutions fail goes here.'}
            </p>
          </div>
        </SectionCard>

        <SectionCard title="Target Persona">
          <div className="space-y-2">
            <h4 className="font-medium text-primary">{data.audience || 'Audience pending'}</h4>
            <ul className="space-y-1 text-sm">
              <li>• What they strive for: {data.promise || 'Define the core promise.'}</li>
              <li>• What blocks them: {data.whyCurrentFails || 'Share the current frustration.'}</li>
            </ul>
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
            {data.mustHaves.length ? (
              data.mustHaves.map((feature, index) => (
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
            {data.notNow.length ? (
              data.notNow.map((feature, index) => (
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

        <SectionCard title="Constraints">
          <p className="text-sm leading-relaxed">
            {data.constraints || 'List timeline, budget, or technical constraints to keep everyone aligned.'}
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
        mustHaves={data.mustHaves}
        notNow={data.notNow}
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
