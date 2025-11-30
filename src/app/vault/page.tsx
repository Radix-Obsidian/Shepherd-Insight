'use client';

/**
 * Decision Vault
 * 
 * Part of the Shepherd Journey: Compass → Muse → Blueprint → Vault
 * 
 * Lock your finalized decisions from Blueprint:
 * - MVP scope locked
 * - Features prioritized
 * - Launch checklist committed
 */

import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import VersionSwitcher from '@/components/VersionSwitcher';
import { useAppStore } from '@/lib/store';
import { Lock, ArrowRight, Compass, BookOpen, FileText } from 'lucide-react';
import { JourneyProgress } from '@/components/journey-progress';

const tabs = [
  { label: 'Insight', href: '/insight' },
  { label: 'Vault', href: '/vault' },
  { label: 'Mind Map', href: '/mindmap' },
  { label: 'Export', href: '/exports' },
];

function VaultPageContent() {
  const params = useSearchParams();
  const projectId = params.get('projectId') || '';
  const versionId = params.get('versionId') || '';
  const blueprintId = params.get('blueprintId') || '';
  
  const version = useAppStore(s =>
    projectId && versionId ? s.getProjectVersion(projectId, versionId) : undefined
  );

  // If no project/version and no blueprint, show journey start
  if (!projectId && !blueprintId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-6">
              <Lock className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-3">
              Decision Vault
            </h1>
            <p className="text-xl text-slate-600">
              Lock Decisions
            </p>
          </div>

          {/* Journey Progress */}
          <JourneyProgress currentStep="compass" />

          {/* Call to Action */}
          <Card className="max-w-xl mx-auto">
            <CardContent className="py-12 text-center">
              <Lock className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Ready to Lock Your Decisions?</h3>
              <p className="text-slate-600 mb-6">
                Complete the Shepherd Journey first to get your MVP blueprint, then lock your decisions here.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/compass">
                  <Button size="lg" className="w-full sm:w-auto">
                    <Compass className="w-5 h-5 mr-2" />
                    Start with Compass
                  </Button>
                </Link>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-200">
                <p className="text-sm text-slate-500 mb-4">The Shepherd Journey</p>
                <div className="flex items-center justify-center gap-3 text-sm">
                  <div className="flex items-center gap-1 text-amber-600">
                    <Compass className="w-4 h-4" />
                    <span>Compass</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300" />
                  <div className="flex items-center gap-1 text-indigo-600">
                    <BookOpen className="w-4 h-4" />
                    <span>Muse</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300" />
                  <div className="flex items-center gap-1 text-emerald-600">
                    <FileText className="w-4 h-4" />
                    <span>Blueprint</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300" />
                  <div className="flex items-center gap-1 text-purple-600 font-medium">
                    <Lock className="w-4 h-4" />
                    <span>Vault</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Legacy project/version flow
  if (!version && projectId) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Decision Vault</h1>
          <p className="text-sm text-gray-600">Lock what&apos;s in, keep track of what waits.</p>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">No version selected</h3>
            <p className="text-sm text-gray-600 mb-4">
              Open an Insight report and lock decisions to populate the vault.
            </p>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!version) return null;

  const data = version.data;
  const locked = version.locked;

  return (
    <div className="space-y-6">
      <nav className="flex gap-4 border-b pb-2 text-sm">
        {tabs.map(tab => {
          const href = `${tab.href}?projectId=${projectId}&versionId=${versionId}`;
          const isActive = tab.href === '/vault';
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

      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Decision Vault</h1>
            <p className="text-sm text-gray-600">This is what&apos;s locked for {data.name} ({version.label}).</p>
          </div>
          <div className="flex items-center gap-2">
            <VersionSwitcher projectId={projectId} />
            <Link href={`/insight?projectId=${projectId}&versionId=${versionId}`}>
              <Button variant="outline">Back to Insight</Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>MVP Feature Set — Locked</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {locked.mustHavesLocked.length ? (
              locked.mustHavesLocked.map((feature, idx) => (
                <div key={idx} className="rounded-lg border border-green-200 bg-green-50 p-3">
                  <div className="font-medium text-green-900">{feature}</div>
                  <p className="mt-1 text-xs text-green-800">
                    Locked for {version.label}. Keep this in scope until the next version.
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600">
                Nothing locked yet. Use Lock Decisions from the Insight report.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Not Now — Parked Scope</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {locked.notNowLocked.length ? (
              locked.notNowLocked.map((feature, idx) => (
                <div key={idx} className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                  <div className="font-medium text-orange-900">NOT NOW — {feature}</div>
                  <p className="mt-1 text-xs text-orange-800">
                    Documented for later versions so your team stays focused.
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600">
                No features parked. Add &quot;not now&quot; items to keep future scope visible.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Constraints & Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-gray-700">
              {data.constraints || 'Add constraints in the Insight report to keep delivery realities visible here.'}
            </p>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Link href={`/exports?projectId=${projectId}&versionId=${versionId}`}>
            <Button>Export Brief</Button>
          </Link>
          <Link href={`/mindmap?projectId=${projectId}`}>
            <Button variant="ghost">Open Mind Map</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VaultPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-semibold">Decision Vault</h1>
            <p className="text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <VaultPageContent />
    </Suspense>
  );
}
