'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import type { ProjectRecord, VersionRecord, VersionData, Decision, DecisionType, DecisionState } from '@/types/project';

interface JourneyData {
  projectName: string;
  clarity: any; // ClarityOutput from Compass
  research?: any; // ResearchOutput from Muse (optional)
  blueprint?: any; // BlueprintOutput from Blueprint (optional)
}

interface StoreState {
  projects: ProjectRecord[];

  createProjectFromIntake: (form: Omit<VersionData, 'positioning' | 'timestampISO'>) => { projectId: string; versionId: string };
  createProjectFromJourney: (journey: JourneyData) => { projectId: string; versionId: string };
  getProject: (projectId: string) => ProjectRecord | undefined;
  getProjectVersion: (projectId: string, versionId: string) => VersionRecord | undefined;
  getLatestVersion: (projectId: string) => VersionRecord | undefined;
  updateVersionData: (projectId: string, versionId: string, patch: Partial<VersionData>) => void;
  lockDecisions: (projectId: string, versionId: string, lock: { mustHavesLocked: string[]; notNowLocked: string[] }) => void;
  cloneVersion: (projectId: string, versionId: string) => { newVersionId: string };
  listProjects: () => ProjectRecord[];
  
  // Decision Vault Management
  createDecisionsFromJourney: (projectId: string, versionId: string, journeyData: any) => void;
  lockDecision: (projectId: string, versionId: string, decisionId: string) => void;
  unlockDecision: (projectId: string, versionId: string, decisionId: string) => void;
  refineDecision: (projectId: string, versionId: string, decisionId: string, refinedContent: any, userRequest: string, aiProvider: string) => void;
  replaceDecision: (projectId: string, versionId: string, decisionId: string, newContent: any, aiProvider: string) => void;
  discardDecision: (projectId: string, versionId: string, decisionId: string) => void;
  scopeOutDecision: (projectId: string, versionId: string, decisionId: string) => void;
  notNowDecision: (projectId: string, versionId: string, decisionId: string) => void;
  getDecisions: (projectId: string, versionId: string, filters?: { type?: DecisionType; state?: DecisionState }) => Decision[];
  getDecisionStats: (projectId: string, versionId: string) => { total: number; locked: number; pending: number; refined: number; replaced: number; discarded: number; scopedOut: number; notNow: number };
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

      createProjectFromJourney: (journey) => {
        const projectId = nanoid();
        const versionId = nanoid();
        const timestamp = nowISO();
        
        // Extract data from Clarity output
        const { clarity } = journey;
        const name = journey.projectName || 'ShepLight Journey';
        
        const version: VersionRecord = {
          id: versionId,
          label: 'v1',
          timestampISO: timestamp,
          data: {
            name,
            audience: clarity.targetUser || 'Users',
            problem: clarity.problemStatement || '',
            promise: clarity.valueHypotheses?.[0] || '',
            whyCurrentFails: clarity.opportunityGap || '',
            mustHaves: clarity.valueHypotheses || [],
            notNow: [],
            positioning: `We help ${clarity.targetUser || 'users'} solve ${clarity.problemStatement || 'their challenges'}.`,
            timestampISO: timestamp,
            // Store raw journey data for export
            journeyData: {
              clarity,
              research: journey.research,
              blueprint: journey.blueprint,
            },
          } as any,
          locked: { mustHavesLocked: [], notNowLocked: [] },
        };
        
        const project: ProjectRecord = {
          id: projectId,
          name,
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

      // Decision Vault Management
      createDecisionsFromJourney: (projectId, versionId, journeyData) => {
        const decisions: Decision[] = [];
        const timestamp = nowISO();
        
        // Create decisions from personas
        if (journeyData.research?.personas) {
          journeyData.research.personas.forEach((persona: any) => {
            decisions.push({
              id: nanoid(),
              type: 'persona',
              content: persona,
              state: 'pending',
              locked: false,
              createdAt: timestamp,
              updatedAt: timestamp,
            });
          });
        }
        
        // Create decisions from pain points
        if (journeyData.research?.painMap) {
          journeyData.research.painMap.forEach((pain: any) => {
            decisions.push({
              id: nanoid(),
              type: 'painPoint',
              content: pain,
              state: 'pending',
              locked: false,
              createdAt: timestamp,
              updatedAt: timestamp,
            });
          });
        }
        
        // Create decisions from insights
        if (journeyData.research?.insights) {
          journeyData.research.insights.forEach((insight: string) => {
            decisions.push({
              id: nanoid(),
              type: 'insight',
              content: { insight: insight, title: insight.substring(0, 60) + (insight.length > 60 ? '...' : '') },
              state: 'pending',
              locked: false,
              createdAt: timestamp,
              updatedAt: timestamp,
            });
          });
        }
        
        // Create decisions from features (blueprint)
        if (journeyData.blueprint?.features) {
          journeyData.blueprint.features.forEach((feature: any) => {
            decisions.push({
              id: nanoid(),
              type: 'feature',
              content: feature,
              state: 'pending',
              locked: false,
              createdAt: timestamp,
              updatedAt: timestamp,
            });
          });
        }
        
        // Create decisions from competitor gaps
        if (journeyData.research?.competitorGaps) {
          journeyData.research.competitorGaps.forEach((gap: any) => {
            decisions.push({
              id: nanoid(),
              type: 'competitorGap',
              content: gap,
              state: 'pending',
              locked: false,
              createdAt: timestamp,
              updatedAt: timestamp,
            });
          });
        }
        
        // Update version with decisions
        set(state => ({
          projects: state.projects.map(project => {
            if (project.id !== projectId) return project;
            return {
              ...project,
              versions: project.versions.map(version => {
                if (version.id !== versionId) return version;
                return {
                  ...version,
                  data: {
                    ...version.data,
                    decisions,
                  },
                };
              }),
            };
          }),
        }));
      },

      lockDecision: (projectId, versionId, decisionId) => {
        set(state => ({
          projects: state.projects.map(project => {
            if (project.id !== projectId) return project;
            return {
              ...project,
              versions: project.versions.map(version => {
                if (version.id !== versionId) return version;
                return {
                  ...version,
                  data: {
                    ...version.data,
                    decisions: version.data.decisions?.map(decision => {
                      if (decision.id !== decisionId) return decision;
                      return {
                        ...decision,
                        locked: true,
                        lockedAt: nowISO(),
                        state: 'locked' as DecisionState,
                        updatedAt: nowISO(),
                      };
                    }),
                  },
                };
              }),
            };
          }),
        }));
      },

      unlockDecision: (projectId, versionId, decisionId) => {
        set(state => ({
          projects: state.projects.map(project => {
            if (project.id !== projectId) return project;
            return {
              ...project,
              versions: project.versions.map(version => {
                if (version.id !== versionId) return version;
                return {
                  ...version,
                  data: {
                    ...version.data,
                    decisions: version.data.decisions?.map(decision => {
                      if (decision.id !== decisionId) return decision;
                      return {
                        ...decision,
                        locked: false,
                        lockedAt: undefined,
                        state: decision.state === 'locked' ? 'pending' : decision.state,
                        updatedAt: nowISO(),
                      };
                    }),
                  },
                };
              }),
            };
          }),
        }));
      },

      refineDecision: (projectId, versionId, decisionId, refinedContent, userRequest, aiProvider) => {
        set(state => ({
          projects: state.projects.map(project => {
            if (project.id !== projectId) return project;
            return {
              ...project,
              versions: project.versions.map(version => {
                if (version.id !== versionId) return version;
                return {
                  ...version,
                  data: {
                    ...version.data,
                    decisions: version.data.decisions?.map(decision => {
                      if (decision.id !== decisionId) return decision;
                      
                      const historyEntry = {
                        timestamp: nowISO(),
                        userRequest,
                        originalContent: decision.content,
                        refinedContent,
                        aiProvider,
                      };
                      
                      return {
                        ...decision,
                        content: refinedContent,
                        state: 'refined' as DecisionState,
                        originalContent: decision.originalContent || decision.content,
                        refinementHistory: [...(decision.refinementHistory || []), historyEntry],
                        updatedAt: nowISO(),
                      };
                    }),
                  },
                };
              }),
            };
          }),
        }));
      },

      replaceDecision: (projectId, versionId, decisionId, newContent, aiProvider) => {
        set(state => ({
          projects: state.projects.map(project => {
            if (project.id !== projectId) return project;
            return {
              ...project,
              versions: project.versions.map(version => {
                if (version.id !== versionId) return version;
                return {
                  ...version,
                  data: {
                    ...version.data,
                    decisions: version.data.decisions?.map(decision => {
                      if (decision.id !== decisionId) return decision;
                      
                      const historyEntry = {
                        timestamp: nowISO(),
                        userRequest: 'Replaced with alternative',
                        originalContent: decision.content,
                        refinedContent: newContent,
                        aiProvider,
                      };
                      
                      return {
                        ...decision,
                        content: newContent,
                        state: 'replaced' as DecisionState,
                        originalContent: decision.originalContent || decision.content,
                        refinementHistory: [...(decision.refinementHistory || []), historyEntry],
                        updatedAt: nowISO(),
                      };
                    }),
                  },
                };
              }),
            };
          }),
        }));
      },

      discardDecision: (projectId, versionId, decisionId) => {
        set(state => ({
          projects: state.projects.map(project => {
            if (project.id !== projectId) return project;
            return {
              ...project,
              versions: project.versions.map(version => {
                if (version.id !== versionId) return version;
                return {
                  ...version,
                  data: {
                    ...version.data,
                    decisions: version.data.decisions?.map(decision => {
                      if (decision.id !== decisionId) return decision;
                      return {
                        ...decision,
                        state: 'discarded' as DecisionState,
                        locked: false,
                        updatedAt: nowISO(),
                      };
                    }),
                  },
                };
              }),
            };
          }),
        }));
      },

      scopeOutDecision: (projectId, versionId, decisionId) => {
        set(state => ({
          projects: state.projects.map(project => {
            if (project.id !== projectId) return project;
            return {
              ...project,
              versions: project.versions.map(version => {
                if (version.id !== versionId) return version;
                return {
                  ...version,
                  data: {
                    ...version.data,
                    decisions: version.data.decisions?.map(decision => {
                      if (decision.id !== decisionId) return decision;
                      return {
                        ...decision,
                        state: 'scopedOut' as DecisionState,
                        locked: false,
                        updatedAt: nowISO(),
                      };
                    }),
                  },
                };
              }),
            };
          }),
        }));
      },

      notNowDecision: (projectId, versionId, decisionId) => {
        set(state => ({
          projects: state.projects.map(project => {
            if (project.id !== projectId) return project;
            return {
              ...project,
              versions: project.versions.map(version => {
                if (version.id !== versionId) return version;
                return {
                  ...version,
                  data: {
                    ...version.data,
                    decisions: version.data.decisions?.map(decision => {
                      if (decision.id !== decisionId) return decision;
                      return {
                        ...decision,
                        state: 'notNow' as DecisionState,
                        locked: false,
                        updatedAt: nowISO(),
                      };
                    }),
                  },
                };
              }),
            };
          }),
        }));
      },

      getDecisions: (projectId, versionId, filters) => {
        const version = get().getProjectVersion(projectId, versionId);
        if (!version?.data.decisions) return [];
        
        let decisions = version.data.decisions;
        
        if (filters?.type) {
          decisions = decisions.filter(d => d.type === filters.type);
        }
        
        if (filters?.state) {
          decisions = decisions.filter(d => d.state === filters.state);
        }
        
        return decisions;
      },

      getDecisionStats: (projectId, versionId) => {
        const decisions = get().getDecisions(projectId, versionId);
        
        return {
          total: decisions.length,
          locked: decisions.filter(d => d.state === 'locked').length,
          pending: decisions.filter(d => d.state === 'pending').length,
          refined: decisions.filter(d => d.state === 'refined').length,
          replaced: decisions.filter(d => d.state === 'replaced').length,
          discarded: decisions.filter(d => d.state === 'discarded').length,
          scopedOut: decisions.filter(d => d.state === 'scopedOut').length,
          notNow: decisions.filter(d => d.state === 'notNow').length,
        };
      },
    }),
    {
      name: 'shepherd-insight-store',
      version: 1,
      partialize: state => ({ projects: state.projects }),
    }
  )
);
