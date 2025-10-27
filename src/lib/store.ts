'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import type { ProjectRecord, VersionRecord, VersionData } from '@/types/project';

interface StoreState {
  projects: ProjectRecord[];

  createProjectFromIntake: (form: Omit<VersionData, 'positioning' | 'timestampISO'>) => { projectId: string; versionId: string };
  getProject: (projectId: string) => ProjectRecord | undefined;
  getProjectVersion: (projectId: string, versionId: string) => VersionRecord | undefined;
  getLatestVersion: (projectId: string) => VersionRecord | undefined;
  updateVersionData: (projectId: string, versionId: string, patch: Partial<VersionData>) => void;
  lockDecisions: (projectId: string, versionId: string, lock: { mustHavesLocked: string[]; notNowLocked: string[] }) => void;
  cloneVersion: (projectId: string, versionId: string) => { newVersionId: string };
  listProjects: () => ProjectRecord[];
}

function nowISO() {
  return new Date().toISOString();
}

function normalizeList(input: string[] | string | undefined) {
  if (Array.isArray(input)) return input.filter(Boolean);
  if (!input) return [];
  return input
    .toString()
    .split('\n')
    .map(item => item.trim())
    .filter(Boolean);
}

function derivePositioning(data: Omit<VersionData, 'positioning' | 'timestampISO'>) {
  return `We help ${data.audience} solve ${data.problem} without ${data.whyCurrentFails}, by ${data.promise}.`;
}

function nextLabel(current: string) {
  const m = current.match(/^v(\d+)$/i);
  if (!m) return 'v2';
  const n = parseInt(m[1]!, 10) + 1;
  return `v${n}`;
}

export const useAppStore = create<StoreState>()(
  persist(
    (set, get) => ({
      projects: [],

      createProjectFromIntake: (form) => {
        const projectId = nanoid();
        const versionId = nanoid();
        const timestamp = nowISO();
        const version: VersionRecord = {
          id: versionId,
          label: 'v1',
          timestampISO: timestamp,
          data: {
            ...form,
            mustHaves: normalizeList(form.mustHaves),
            notNow: normalizeList(form.notNow),
            positioning: derivePositioning(form),
            timestampISO: timestamp,
            name: form.name,
          },
          locked: { mustHavesLocked: [], notNowLocked: [] },
        };
        const project: ProjectRecord = {
          id: projectId,
          name: form.name || 'Untitled Project',
          createdAtISO: timestamp,
          versions: [version],
        };
        set(state => ({ projects: [project, ...state.projects] }));
        return { projectId, versionId };
      },

      getProject: (projectId) => get().projects.find(project => project.id === projectId),

      getProjectVersion: (projectId, versionId) => {
        const project = get().projects.find(p => p.id === projectId);
        return project?.versions.find(v => v.id === versionId);
      },

      getLatestVersion: (projectId) => {
        const project = get().projects.find(p => p.id === projectId);
        if (!project || project.versions.length === 0) return undefined;
        return [...project.versions].sort((a, b) => a.timestampISO.localeCompare(b.timestampISO)).at(-1);
      },

      updateVersionData: (projectId, versionId, patch) => {
        set(state => ({
          projects: state.projects.map(project => {
            if (project.id !== projectId) return project;
            return {
              ...project,
              versions: project.versions.map(version => {
                if (version.id !== versionId) return version;
                const nextData: VersionData = {
                  ...version.data,
                  ...patch,
                };
                if (patch.mustHaves !== undefined) {
                  nextData.mustHaves = normalizeList(patch.mustHaves);
                }
                if (patch.notNow !== undefined) {
                  nextData.notNow = normalizeList(patch.notNow);
                }
                nextData.positioning = patch.positioning ?? version.data.positioning ?? derivePositioning(nextData);
                nextData.timestampISO = nowISO();
                return {
                  ...version,
                  data: nextData,
                };
              }),
            };
          }),
        }));
      },

      lockDecisions: (projectId, versionId, lock) => {
        set(state => ({
          projects: state.projects.map(project => {
            if (project.id !== projectId) return project;
            return {
              ...project,
              versions: project.versions.map(version =>
                version.id === versionId ? { ...version, locked: { ...lock } } : version
              ),
            };
          }),
        }));
      },

      cloneVersion: (projectId, versionId) => {
        const project = get().projects.find(p => p.id === projectId);
        if (!project) throw new Error('Project not found');
        const current = project.versions.find(v => v.id === versionId);
        if (!current) throw new Error('Version not found');

        const newVersionId = nanoid();
        const label = nextLabel(current.label);
        const timestamp = nowISO();
        const cloned: VersionRecord = {
          ...current,
          id: newVersionId,
          label,
          timestampISO: timestamp,
          data: {
            ...current.data,
            timestampISO: timestamp,
          },
          locked: { mustHavesLocked: [], notNowLocked: [] },
        };

        set({
          projects: get().projects.map(p =>
            p.id === projectId ? { ...p, versions: [...p.versions, cloned] } : p
          ),
        });

        return { newVersionId };
      },

      listProjects: () => get().projects,
    }),
    {
      name: 'shepherd-insight-store',
      version: 1,
      partialize: state => ({ projects: state.projects }),
    }
  )
);
