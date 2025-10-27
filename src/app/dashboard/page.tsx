'use client';

import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const projects = useAppStore(s => s.listProjects());

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Your Projects</h1>
          <p className="text-sm text-gray-600">Each project is an idea you’re shaping.</p>
        </div>
        <Link href="/intake">
          <Button>+ Start a New Idea</Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Let’s start your first idea.</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              We’ll guide you from idea to a clear plan you can share.
            </p>
            <Link href="/intake">
              <Button>Start now</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map(project => {
            const latest = [...project.versions].sort((a, b) =>
              a.timestampISO.localeCompare(b.timestampISO)
            ).at(-1)!;
            const qs = `?projectId=${project.id}&versionId=${latest.id}`;
            return (
              <Card key={project.id}>
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Updated {new Date(latest.timestampISO).toLocaleString()}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <Link href={`/insight${qs}`}>
                      <Button>Open Insight</Button>
                    </Link>
                    <Link href={`/vault${qs}`}>
                      <Button variant="secondary">View Vault</Button>
                    </Link>
                    <Link href={`/exports${qs}`}>
                      <Button variant="ghost">Export</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
