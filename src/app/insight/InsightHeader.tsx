'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import VersionSwitcher from '@/components/VersionSwitcher';
import { useAppStore } from '@/lib/store';

export function InsightHeader() {
  const router = useRouter();
  const params = useSearchParams();
  const projectId = params.get('projectId') || '';
  const versionId = params.get('versionId') || '';
  const cloneVersion = useAppStore(s => s.cloneVersion);

  async function onCreateNewVersion() {
    if (!projectId || !versionId) return;
    const { newVersionId } = cloneVersion(projectId, versionId);
    const url = new URL(window.location.href);
    url.searchParams.set('versionId', newVersionId);
    router.push(url.pathname + '?' + url.searchParams.toString());
  }

  return (
    <div className="flex items-center justify-between gap-3 border-b pb-3">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Insight Report</h1>
        <p className="text-sm text-gray-600">Structured brief, pains, MVP, and positioning.</p>
      </div>
      <div className="flex items-center gap-2">
        {projectId && <VersionSwitcher projectId={projectId} />}
        <Button onClick={onCreateNewVersion}>Create New Version</Button>
      </div>
    </div>
  );
}
