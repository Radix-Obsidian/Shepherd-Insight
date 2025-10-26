export interface VersionData {
  name: string;
  audience: string;
  problem: string;
  why_current_fails: string;
  promise: string;
  must_haves: string[];
  not_now: string[];
  constraints: string;
}

export interface VersionRecord {
  id: string;
  version_number: number;
  name: string;
  audience: string;
  problem: string;
  why_current_fails: string;
  promise: string;
  must_haves: string[];
  not_now: string[];
  constraints: string;
  locked_decisions: {
    mustHavesLocked: string[];
    notNowLocked: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface ProjectRecord {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  versions: VersionRecord[];
}
