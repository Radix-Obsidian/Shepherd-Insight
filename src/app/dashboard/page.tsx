'use client';

import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Compass, BookOpen, FileText, ArrowRight, Sparkles } from 'lucide-react';

export default function DashboardPage() {
  const projects = useAppStore(s => s.listProjects());

  return (
    <div className="p-6 space-y-8">
      {/* Shepherd Journey CTA */}
      <div className="bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-500 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Start Your Shepherd Journey</h1>
        </div>
        <p className="text-lg text-white/90 mb-6 max-w-2xl">
          Transform your idea into a clear, actionable MVP plan in three simple steps.
        </p>
        
        {/* Journey Steps */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
            <Compass className="w-5 h-5" />
            <span className="font-medium">Compass</span>
            <span className="text-white/70 text-sm">Find Clarity</span>
          </div>
          <ArrowRight className="w-5 h-5 text-white/50" />
          <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
            <BookOpen className="w-5 h-5" />
            <span className="font-medium">Muse</span>
            <span className="text-white/70 text-sm">Understand Users</span>
          </div>
          <ArrowRight className="w-5 h-5 text-white/50" />
          <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
            <FileText className="w-5 h-5" />
            <span className="font-medium">Blueprint</span>
            <span className="text-white/70 text-sm">Build Plan</span>
          </div>
        </div>

        <Link href="/compass">
          <Button size="lg" className="bg-white text-slate-900 hover:bg-white/90 font-semibold">
            Begin Your Journey
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </div>

      {/* Legacy Projects Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Your Projects</h2>
          <p className="text-sm text-gray-600">Each project is an idea you&apos;re shaping.</p>
        </div>
        <Link href="/compass">
          <Button>+ Start a New Idea</Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Let&apos;s start your first idea.</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              We&apos;ll guide you from idea to a clear plan you can share.
            </p>
            <Link href="/compass">
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
