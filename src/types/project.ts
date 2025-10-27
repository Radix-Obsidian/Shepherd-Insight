export interface VersionData {
  name: string;
  audience: string;
  problem: string;
  whyCurrentFails: string;
  promise: string;
  mustHaves: string[];
  notNow: string[];
  constraints: string;
  positioning?: string;
  timestampISO?: string;
}

export interface LockedDecisions {
  mustHavesLocked: string[];
  notNowLocked: string[];
}

export interface VersionRecord {
  id: string;
  label: string;
  timestampISO: string;
  data: VersionData;
  locked: LockedDecisions;
  mindmapJson?: { nodes: unknown[]; edges: unknown[] };
}

export interface ProjectRecord {
  id: string;
  name: string;
  createdAtISO: string;
  versions: VersionRecord[];
}
