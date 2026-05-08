import { CONTEXT_AREAS } from '@horizon/shared'
import type { ContextAreaSummary, ContextAreaSection, ContextAreaGap } from '@horizon/shared'

export type { ContextAreaSummary, ContextAreaSection, ContextAreaGap }

export interface ContextArea {
  key: string
  name: string
  description: string
  order: number
  completenessScore: number
  rawContent: string
  structuredSections: ContextAreaSection[]
  hasAiContent: boolean
  lastUpdated: string | null
  gaps: ContextAreaGap[]
}

export function buildContextAreas(summaries: ContextAreaSummary[] = []): ContextArea[] {
  const map = Object.fromEntries(summaries.map((s) => [s.areaKey, s]))
  return CONTEXT_AREAS.map((area) => {
    const s = map[area.key]
    return {
      ...area,
      completenessScore: s?.completeness ?? 0,
      rawContent: '',
      structuredSections: [],
      hasAiContent: false,
      lastUpdated: s?.updatedAt ?? null,
      gaps: [],
    }
  })
}

export function computeOverallScore(areas: ContextArea[]): number {
  if (areas.length === 0) return 0
  const total = areas.reduce((sum, a) => sum + a.completenessScore, 0)
  return Math.round(total / areas.length)
}

export function areaKeyToUrl(key: string): string {
  return key.replace(/_/g, '-')
}

export function urlToAreaKey(url: string): string {
  return url.replace(/-/g, '_')
}
