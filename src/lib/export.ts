'use client';

import { jsPDF } from 'jspdf';
import * as htmlToImage from 'html-to-image';
import type { VersionRecord } from '@/types/project';

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
