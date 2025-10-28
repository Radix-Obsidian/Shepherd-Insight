'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { buildMarkdown, downloadTextFile, buildAndDownloadPDF } from '@/lib/export';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const tabs = [
  { label: 'Insight', href: '/insight' },
  { label: 'Vault', href: '/vault' },
  { label: 'Mind Map', href: '/mindmap' },
  { label: 'Export', href: '/exports' },
];

function ExportsPageContent() {
  const params = useSearchParams();
  const projectId = params.get('projectId') || '';
  const versionId = params.get('versionId') || '';
  const version = useAppStore(s => s.getProjectVersion(projectId, versionId));

  if (!projectId || !versionId || !version) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Export Your Insight Brief</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              No version selected. Open a project’s Insight or Vault and use the Export tab, or pass <code>?projectId=...&versionId=...</code> in the URL.
            </p>
          </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  const currentVersion = version!;

 async function handleMd() {
   const md = buildMarkdown(currentVersion);
   const base = (currentVersion.data.name || 'project').toLowerCase().replace(/\s+/g, '-');
   downloadTextFile(`${base}-insight-${currentVersion.label}.md`, md, 'text/markdown;charset=utf-8');
 }

 async function handlePdf() {
   await buildAndDownloadPDF(currentVersion, { includeMindmap: true, mindmapElementId: 'mindmap-canvas' });
 }

 return (
   <div className="space-y-6">
     <nav className="flex gap-4 border-b pb-2 text-sm">
       {tabs.map(tab => {
         const href = `${tab.href}?projectId=${projectId}&versionId=${versionId}`;
         const isActive = tab.href === '/exports';
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
     <Card>
       <CardHeader>
         <CardTitle>Export Your Insight Brief</CardTitle>
       </CardHeader>
       <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="rounded-lg border p-4">
           <h3 className="font-medium mb-2">Markdown Export</h3>
           <p className="text-sm text-gray-600 mb-3">
             Download a clean .md brief you can paste into GitHub issues, Notion, or docs.
           </p>
           <Button onClick={handleMd}>Download as Markdown (.md)</Button>
         </div>

         <div className="rounded-lg border p-4">
           <h3 className="font-medium mb-2">PDF Export</h3>
           <p className="text-sm text-gray-600 mb-3">
             Generate a shareable PDF with your brief and an embedded mind-map snapshot.
           </p>
           <Button onClick={handlePdf}>Download as PDF (.pdf)</Button>
         </div>
       </CardContent>
     </Card>

     <Card>
       <CardHeader>
         <CardTitle>Tips</CardTitle>
       </CardHeader>
       <CardContent className="text-sm text-gray-600 space-y-2">
         <p>• Ensure the mind-map canvas is visible on the Mind Map page for best image quality.</p>
         <p>• Re-generate the PDF after updating decisions or features to keep the snapshot fresh.</p>
       </CardContent>
     </Card>
   </div>
 );
}

export default function ExportsPage() {
 return (
   <Suspense fallback={
     <div className="p-6">
       <Card>
         <CardHeader>
           <CardTitle>Export Your Insight Brief</CardTitle>
         </CardHeader>
         <CardContent>
           <p className="text-sm text-gray-600">Loading...</p>
         </CardContent>
       </Card>
     </div>
   }>
     <ExportsPageContent />
   </Suspense>
 );
}
