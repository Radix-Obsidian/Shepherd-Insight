'use client';

import { jsPDF } from 'jspdf';
import * as htmlToImage from 'html-to-image';
import type { VersionRecord, Decision } from '@/types/project';

// ============================================================================
// AI DEV PROMPT GENERATOR (Phase 3)
// ============================================================================

/**
 * Formats a persona decision into readable prompt text
 */
function formatPersonaForPrompt(content: any): string {
  const name = content.name || 'Unnamed Persona';
  const role = content.role || content.title || '';
  const quote = content.quote || content.tagline || '';
  const goals = content.goals || [];
  const frustrations = content.frustrations || content.painPoints || [];
  
  let text = `### ${name}`;
  if (role) text += ` (${role})`;
  text += '\n';
  if (quote) text += `> "${quote}"\n\n`;
  if (goals.length) {
    text += `**Goals:**\n${goals.map((g: string) => `- ${g}`).join('\n')}\n\n`;
  }
  if (frustrations.length) {
    text += `**Frustrations:**\n${frustrations.map((f: string) => `- ${f}`).join('\n')}\n`;
  }
  return text;
}

/**
 * Formats a feature decision into readable prompt text
 */
function formatFeatureForPrompt(content: any): string {
  const name = content.name || content.title || 'Unnamed Feature';
  const description = content.description || content.userStory || '';
  const priority = content.priority || '';
  const acceptance = content.acceptanceCriteria || [];
  
  let text = `### ${name}`;
  if (priority) text += ` [${priority}]`;
  text += '\n';
  if (description) text += `${description}\n\n`;
  if (acceptance.length) {
    text += `**Acceptance Criteria:**\n${acceptance.map((a: string) => `- ${a}`).join('\n')}\n`;
  }
  return text;
}

/**
 * Formats a pain point decision into readable prompt text
 */
function formatPainPointForPrompt(content: any): string {
  const pain = content.pain || content.description || content.text || 'Unnamed Pain Point';
  const intensity = content.intensity || content.severity || '';
  const context = content.context || content.impact || '';
  
  let text = `- **${pain}**`;
  if (intensity) text += ` (Intensity: ${intensity})`;
  text += '\n';
  if (context) text += `  ${context}\n`;
  return text;
}

/**
 * Formats an insight decision into readable prompt text
 */
function formatInsightForPrompt(content: any): string {
  const insight = content.insight || content.title || content.text || 'Unnamed Insight';
  const evidence = content.evidence || content.source || '';
  const implication = content.implication || content.actionable || '';
  
  let text = `- **${insight}**\n`;
  if (evidence) text += `  Evidence: ${evidence}\n`;
  if (implication) text += `  Implication: ${implication}\n`;
  return text;
}

/**
 * Formats a competitor gap decision into readable prompt text
 */
function formatCompetitorGapForPrompt(content: any): string {
  const competitor = content.competitor || content.name || 'Competitor';
  const weakness = content.weakness || content.gap || '';
  const opportunity = content.opportunity || '';
  
  let text = `- **${competitor}:**`;
  if (weakness) text += ` ${weakness}`;
  text += '\n';
  if (opportunity) text += `  Opportunity: ${opportunity}\n`;
  return text;
}

/**
 * Generates a comprehensive AI development prompt from locked decisions
 * This is the "killer feature" - ready to paste into Claude/Cursor/Windsurf
 */
export function buildAIDevPrompt(v: VersionRecord, decisions: Decision[]): string {
  const d = v.data;
  const lockedDecisions = decisions.filter(dec => dec.locked || dec.state === 'locked' || dec.state === 'refined' || dec.state === 'replaced');
  
  // Group decisions by type
  const personas = lockedDecisions.filter(dec => dec.type === 'persona');
  const features = lockedDecisions.filter(dec => dec.type === 'feature');
  const painPoints = lockedDecisions.filter(dec => dec.type === 'painPoint');
  const insights = lockedDecisions.filter(dec => dec.type === 'insight');
  const competitorGaps = lockedDecisions.filter(dec => dec.type === 'competitorGap');
  
  // Extract journey data if available
  const clarity = d.journeyData?.clarity || {};
  const research = d.journeyData?.research || {};
  const blueprint = d.journeyData?.blueprint || {};
  
  const prompt = `# ${d.name || 'Project'} - AI Development Blueprint

## Overview

**Problem Statement:**
${d.problem || clarity.problemStatement || '_Not defined_'}

**Target User:**
${d.audience || clarity.targetUser || '_Not defined_'}

**Why Current Solutions Fail:**
${d.whyCurrentFails || '_Not defined_'}

**Our Promise:**
${d.promise || clarity.valueProposition || '_Not defined_'}

---

## User Personas
${personas.length > 0 
  ? personas.map(p => formatPersonaForPrompt(p.content)).join('\n')
  : '_No personas locked. Consider the target user above._'}

---

## Core Features (MVP Scope)
${features.length > 0
  ? features.map(f => formatFeatureForPrompt(f.content)).join('\n')
  : d.mustHaves?.length 
    ? d.mustHaves.map(f => `- ${f}`).join('\n')
    : '_No features locked._'}

---

## User Pain Points to Address
${painPoints.length > 0
  ? painPoints.map(p => formatPainPointForPrompt(p.content)).join('\n')
  : '_No pain points locked._'}

---

## Key Insights from Research
${insights.length > 0
  ? insights.map(i => formatInsightForPrompt(i.content)).join('\n')
  : '_No insights locked._'}

---

## Competitor Gaps & Opportunities
${competitorGaps.length > 0
  ? competitorGaps.map(c => formatCompetitorGapForPrompt(c.content)).join('\n')
  : '_No competitor gaps locked._'}

---

## Out of Scope (Not Now)
${d.notNow?.length 
  ? d.notNow.map(f => `- ${f}`).join('\n')
  : '_Nothing explicitly parked._'}

---

## Constraints
${d.constraints || '_No constraints specified._'}

---

## Development Instructions

You are an expert software engineer building a product for the users and problems described above.

**Tech Stack Recommendations:**
- Frontend: Next.js 14 (App Router), TypeScript, TailwindCSS
- UI Components: Radix UI or shadcn/ui
- State Management: Zustand or React Context
- Database: Supabase (PostgreSQL) or your preferred backend
- Authentication: Supabase Auth or NextAuth

**Build Guidelines:**
1. Start with the user personas above - every feature should serve their needs
2. Address the pain points directly - these are your success metrics
3. Implement MVP features one at a time (vertical slice delivery)
4. Keep the "Not Now" list visible - resist scope creep
5. Write clean, production-ready TypeScript code
6. Follow accessibility best practices (WCAG 2.1 AA)
7. Design mobile-first, then enhance for desktop

**Getting Started:**
1. Set up the project structure with the tech stack above
2. Implement authentication and user management first
3. Build the core feature that addresses the #1 pain point
4. Iterate based on the personas' goals and frustrations
5. Test with real users matching the target persona

---

*Generated by ShepLight - From idea to clarity in minutes*
*Decisions locked: ${lockedDecisions.length} | Generated: ${new Date().toLocaleString()}*
`;

  return prompt;
}

/**
 * Copies the AI Dev Prompt to clipboard
 */
export async function copyAIDevPromptToClipboard(v: VersionRecord, decisions: Decision[]): Promise<boolean> {
  try {
    const prompt = buildAIDevPrompt(v, decisions);
    await navigator.clipboard.writeText(prompt);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Downloads the AI Dev Prompt as a markdown file
 */
export function downloadAIDevPrompt(v: VersionRecord, decisions: Decision[]): void {
  const prompt = buildAIDevPrompt(v, decisions);
  const base = (v.data.name || 'project').toLowerCase().replace(/\s+/g, '-');
  downloadTextFile(`${base}-ai-dev-prompt-${v.label}.md`, prompt, 'text/markdown;charset=utf-8');
}

export function buildMarkdown(v: VersionRecord) {
  const d = v.data;
  const ts = new Date(v.timestampISO).toLocaleString();
  const md = [
    `# ${d.name || 'Untitled Project'} — Insight Brief (${v.label})`,
    ``,
    `**Timestamp:** ${ts}`,
    ``,
    `## Problem Summary`,
    d.problem ? d.problem : '_Not provided_',
    ``,
    `**Why current solutions fail**`,
    d.whyCurrentFails ? d.whyCurrentFails : '_Not provided_',
    ``,
    `## Target Persona`,
    d.audience ? d.audience : '_Not provided_',
    ``,
    `## Top Pain Points`,
    ...(d.problem
      ? [`- Loses time due to: ${d.problem}`, `- Feels blocked by: ${d.whyCurrentFails || 'status quo'}`]
      : ['- _Not provided_']),
    ``,
    `## MVP Feature Set`,
    ...(d.mustHaves.length ? d.mustHaves.map(f => `- ${f}`) : ['- _None_']),
    ``,
    `## Out of Scope (Not Now)`,
    ...(d.notNow.length ? d.notNow.map(f => `- ${f}`) : ['- _None_']),
    ``,
    `## Constraints`,
    d.constraints ? d.constraints : '_Not provided_',
    ``,
    `## Positioning`,
    d.positioning ? d.positioning : `_We help ${d.audience || 'users'} solve ${d.problem || 'their problem'} without ${d.whyCurrentFails || 'frustration'}, by ${d.promise || 'our approach'}._`,
    ``,
    `---`,
    `Mind Map Snapshot: (attach image in PDF export)`,
  ].join('\n');
  return md;
}

export function downloadTextFile(filename: string, content: string, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

export async function captureMindmapPNG(canvasElementId = 'mindmap-canvas'): Promise<string | null> {
  const el = document.getElementById(canvasElementId);
  if (!el) return null;
  const dataUrl = await htmlToImage.toPng(el, { pixelRatio: 2, cacheBust: true, backgroundColor: 'white' });
  return dataUrl;
}

export async function buildAndDownloadPDF(v: VersionRecord, opts?: { includeMindmap?: boolean; mindmapElementId?: string }) {
  const d = v.data;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = margin;

  function title(txt: string) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(txt, margin, y);
    y += 24;
  }

  function section(h: string, body: string) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(h, margin, y);
    y += 18;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(body || '_Not provided_', pageWidth - margin * 2);
    doc.text(lines, margin, y);
    y += 16 * lines.length + 6;
  }

  function bullets(h: string, items: string[]) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(h, margin, y);
    y += 18;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    if (!items?.length) {
      const lines = doc.splitTextToSize('_None_', pageWidth - margin * 2);
      doc.text(lines, margin, y);
      y += 20;
      return;
    }
    items.forEach(item => {
      const lines = doc.splitTextToSize(`• ${item}`, pageWidth - margin * 2);
      doc.text(lines, margin, y);
      y += 16 * lines.length + 4;
    });
  }

  title(`${d.name || 'Untitled Project'} — ${v.label}`);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Timestamp: ${new Date(v.timestampISO).toLocaleString()}`, margin, y);
  y += 18;

  section('Problem Summary', d.problem);
  section('Why current solutions fail', d.whyCurrentFails);
  section('Target Persona', d.audience);
  bullets('MVP Feature Set', d.mustHaves || []);
  bullets('Out of Scope (Not Now)', d.notNow || []);
  section('Constraints', d.constraints);
  section('Positioning', d.positioning || `We help ${d.audience || 'users'} solve ${d.problem || 'their problem'} without ${d.whyCurrentFails || 'friction'}, by ${d.promise || 'our approach'}.`);

  if (opts?.includeMindmap) {
    const id = opts.mindmapElementId || 'mindmap-canvas';
    const dataUrl = await captureMindmapPNG(id);
    if (dataUrl) {
      const imgWidth = pageWidth - margin * 2;
      const imgProps = doc.getImageProperties(dataUrl);
      const ratio = imgProps.height / imgProps.width;
      const imgHeight = imgWidth * ratio;

      if (y + imgHeight + margin > doc.internal.pageSize.getHeight()) {
        doc.addPage();
        y = margin;
      }
      title('Mind Map Snapshot');
      doc.addImage(dataUrl, 'PNG', margin, y, imgWidth, imgHeight, undefined, 'FAST');
      y += imgHeight + 10;
    }
  }

  doc.save(`${(d.name || 'project').toLowerCase().replace(/\s+/g, '-')}-insight-${v.label}.pdf`);
}
