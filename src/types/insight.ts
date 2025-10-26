export interface InsightData {
  pain_points: PainPoint[]
  competitors: Competitor[]
  opportunities: Opportunity[]
  MVP_features: string[]
  out_of_scope: string[]
  personas: Persona[]
  citations: Citation[]
}

export interface PainPoint {
  id: string
  description: string
  severity: 'low' | 'medium' | 'high'
  frequency: number
  sources: string[]
}

export interface Competitor {
  name: string
  url: string
  pricing: string
  features: string[]
  weaknesses: string[]
}

export interface Opportunity {
  id: string
  description: string
  market_size: string
  competition_level: 'low' | 'medium' | 'high'
  sources: string[]
}

export interface Persona {
  id: string
  name: string
  description: string
  pain_points: string[]
  goals: string[]
  demographics: {
    age_range: string
    income: string
    location: string
  }
}

export interface Citation {
  id: string
  url: string
  title: string
  snippet: string
  relevance_score: number
}

export interface ResearchJob {
  id: string
  user_id: string
  project_id: string
  query: string
  status: 'running' | 'completed' | 'failed'
  insight_data?: InsightData
  artifacts?: any
  created_at: string
  completed_at?: string
}
