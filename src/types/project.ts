export type DecisionState = 
  | 'pending'      // From journey, not reviewed yet
  | 'locked'       // User approved, keep as-is
  | 'refined'      // User refined it
  | 'replaced'     // User replaced with alternative
  | 'discarded'    // User removed it
  | 'scopedOut'    // User marked as out of scope (future version)
  | 'notNow'       // User parked for later consideration

export type DecisionType = 
  | 'feature' 
  | 'persona' 
  | 'painPoint' 
  | 'insight' 
  | 'competitorGap'
  | 'emotionalJourneyStage'

export interface RefinementHistoryEntry {
  timestamp: string
  userRequest: string
  originalContent: any
  refinedContent: any
  aiProvider: string
}

export interface Decision {
  id: string
  type: DecisionType
  content: any  // The actual decision data (feature object, persona object, etc.)
  state: DecisionState
  originalContent?: any  // If refined/replaced, keep original for comparison
  refinementHistory?: RefinementHistoryEntry[]
  locked: boolean
  lockedAt?: string
  createdAt: string
  updatedAt: string
}

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
  journeyData?: {
    clarity?: any;
    research?: any;
    blueprint?: any;
  };
  decisions?: Decision[]  // NEW: Structured decisions with states
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
