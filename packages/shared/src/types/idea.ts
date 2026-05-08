export type IdeaStatus = 'NEW' | 'EXPLORING' | 'VALIDATED' | 'ARCHIVED' | 'DISMISSED'

export interface Idea {
  id: string
  name: string
  description: string | null
  status: IdeaStatus
  origin: string | null
  userId: string
  createdAt: string
  updatedAt: string
  lastAnalysis: string | null
  lastAnalysedAt: string | null
  rawNotes: string | null
}

export interface ContextAreaSummary {
  areaKey: string
  completeness: number
  updatedAt: string | null
}

export interface ContextAreaSection {
  id: string
  title: string
  content: string
  aiGenerated: boolean
  status: 'pending' | 'accepted' | 'rejected'
  updatedAt: string
}

export interface ContextAreaGap {
  id: string
  title: string
  reason: string
  action: 'manual' | 'agent'
}

export interface ContextAreaContent {
  areaKey: string
  rawContent: string
  sections: ContextAreaSection[]
  gaps: ContextAreaGap[]
  completeness: number
  structuredAt: string | null
  updatedAt: string | null
}
