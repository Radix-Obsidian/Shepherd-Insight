export interface VersionData {
  name: string;
  audience: string;
  problem: string;
  whyCurrentFails: string;
  promise: string;
  mustHaves: string[];
  notNow: string[];
  constraints: string;
}

export interface VersionRecord {
  id: string;
  timestamp: string;
  data: VersionData;
  lockedDecisions: {
    mustHavesLocked: string[];
    notNowLocked: string[];
  };
}

export interface ProjectRecord {
  id: string;
  name: string;
  versions: VersionRecord[];
}
