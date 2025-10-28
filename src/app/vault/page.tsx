'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import VersionSwitcher from '@/components/VersionSwitcher';
import { useAppStore } from '@/lib/store';

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
  const version = useAppStore(s =>
    projectId && versionId ? s.getProjectVersion(projectId, versionId) : undefined
  );

  if (!projectId || !versionId || !version) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Decision Vault</h1>
          <p className="text-sm text-gray-600">Lock what’s in, keep track of what waits.</p>
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

      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Decision Vault</h1>
          <p className="text-sm text-gray-600">This is what’s locked for {data.name} ({version.label}).</p>
        </div>
        <div className="flex gap-2 items-center">
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
              <div key={idx} className="border border-green-200 rounded-lg p-3 bg-green-50">
                <div className="font-medium text-green-900">{feature}</div>
                <p className="text-xs text-green-800 mt-1">
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
              <div key={idx} className="border border-orange-200 rounded-lg p-3 bg-orange-50">
                <div className="font-medium text-orange-900">NOT NOW — {feature}</div>
                <p className="text-xs text-orange-800 mt-1">
                  Documented for later versions so your team stays focused.
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-600">
              No features parked. Add “not now” items to keep future scope visible.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Constraints & Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 leading-relaxed">
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
  );
}

export default function VaultPage() {
  return (
    <Suspense fallback={
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Decision Vault</h1>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <VaultPageContent />
    </Suspense>
  );
}
