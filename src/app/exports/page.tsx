'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { buildMarkdown, downloadTextFile, buildAndDownloadPDF, copyAIDevPromptToClipboard, downloadAIDevPrompt } from '@/lib/export';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Copy, Download, Check } from 'lucide-react';

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
  const getDecisions = useAppStore(s => s.getDecisions);
  const [copied, setCopied] = useState(false);

  // Get decisions for AI Dev Prompt
  const decisions = projectId && versionId ? getDecisions(projectId, versionId) : [];
  const lockedDecisions = decisions.filter(d => d.locked || d.state === 'locked' || d.state === 'refined' || d.state === 'replaced');

  if (!projectId || !versionId || !version) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Export Your Insight Brief</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              No version selected. Open a project&apos;s Insight or Vault and use the Export tab, or pass <code>?projectId=...&versionId=...</code> in the URL.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const currentVersion = version!;

  const handleMd = async () => {
    const md = buildMarkdown(currentVersion);
    const base = (currentVersion.data.name || 'project').toLowerCase().replace(/\s+/g, '-');
    downloadTextFile(`${base}-insight-${currentVersion.label}.md`, md, 'text/markdown;charset=utf-8');
  };

  const handlePdf = async () => {
    await buildAndDownloadPDF(currentVersion, { includeMindmap: true, mindmapElementId: 'mindmap-canvas' });
  };

  const handleCopyAIPrompt = async () => {
    const success = await copyAIDevPromptToClipboard(currentVersion, decisions);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadAIPrompt = () => {
    downloadAIDevPrompt(currentVersion, decisions);
  };

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

     {/* AI Dev Prompt Export - Phase 3 */}
     <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
       <CardHeader>
         <CardTitle className="flex items-center gap-2">
           <Sparkles className="w-5 h-5 text-purple-600" />
           AI Development Prompt
         </CardTitle>
       </CardHeader>
       <CardContent className="space-y-4">
         <p className="text-sm text-gray-700">
           Generate a comprehensive prompt from your locked decisions – ready to paste into Claude, Cursor, or Windsurf to start building your app.
         </p>
         
         <div className="bg-white rounded-lg border p-4 space-y-3">
           <div className="flex items-center justify-between">
             <div>
               <h4 className="font-medium text-sm">Decisions Ready</h4>
               <p className="text-xs text-gray-500">
                 {lockedDecisions.length} locked decision{lockedDecisions.length !== 1 ? 's' : ''} will be included
               </p>
             </div>
             <div className="text-right">
               <span className={`text-2xl font-bold ${lockedDecisions.length > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                 {lockedDecisions.length}
               </span>
             </div>
           </div>
           
           {lockedDecisions.length === 0 && (
             <div className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">
               <strong>Tip:</strong> Lock some decisions in the Vault first to generate a meaningful AI prompt.
             </div>
           )}
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
           <Button 
             onClick={handleCopyAIPrompt} 
             variant="outline"
             className="gap-2"
             disabled={lockedDecisions.length === 0}
           >
             {copied ? (
               <>
                 <Check className="w-4 h-4 text-green-600" />
                 Copied!
               </>
             ) : (
               <>
                 <Copy className="w-4 h-4" />
                 Copy to Clipboard
               </>
             )}
           </Button>
           
           <Button 
             onClick={handleDownloadAIPrompt}
             className="gap-2 bg-purple-600 hover:bg-purple-700"
             disabled={lockedDecisions.length === 0}
           >
             <Download className="w-4 h-4" />
             Download as .md
           </Button>
         </div>

         <p className="text-xs text-gray-500 pt-2 border-t">
           The prompt includes: problem statement, personas, MVP features, pain points, insights, competitor gaps, and development instructions.
         </p>
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
    </div>
  );
}

export default function ExportsPage() {
  return (
    <Suspense
      fallback={
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
      }
    >
      <ExportsPageContent />
    </Suspense>
  );
}
