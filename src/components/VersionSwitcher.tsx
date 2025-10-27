'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface Props {
  projectId: string;
  className?: string;
}

export default function VersionSwitcher({ projectId, className }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const versionId = params.get('versionId') || '';
  const project = useAppStore(s => s.getProject(projectId));
  const versions = project?.versions ?? [];

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const vId = e.target.value;
    const url = new URL(window.location.href);
    url.searchParams.set('projectId', projectId);
    url.searchParams.set('versionId', vId);
    router.push(url.pathname + '?' + url.searchParams.toString());
  }

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <label htmlFor="version" className="text-sm text-gray-600">
        Version
      </label>
      <select
        id="version"
        value={versionId}
        onChange={onChange}
        className="rounded-md border px-2 py-1 text-sm bg-white"
      >
        {versions.map(v => (
          <option key={v.id} value={v.id}>
            {v.label}
          </option>
        ))}
      </select>
    </div>
  );
}
