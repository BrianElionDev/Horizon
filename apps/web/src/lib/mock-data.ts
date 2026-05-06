import { CONTEXT_AREAS } from '@horizon/shared'
import type { IdeaStatus } from '@horizon/shared'

// ─── Extended types ───

export interface MockGap {
  id: string
  title: string
  reason: string
  action: 'manual' | 'agent'
}

export interface MockContextArea {
  key: string
  name: string
  description: string
  order: number
  completenessScore: number
  rawContent: string
  structuredSections: { title: string; content: string; aiGenerated: boolean }[]
  hasAiContent: boolean
  lastUpdated: string | null
  gaps: MockGap[]
}

export interface MockAgentTask {
  id: string
  productId: string
  productName: string
  contextAreaKey: string
  contextAreaName: string
  agentType: string
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'
  startedAt: string
  completedAt: string | null
  error: string | null
}

export interface MockRisk {
  category: string
  level: 'low' | 'medium' | 'high'
  description: string
}

export interface MockValidationReport {
  overallScore: number
  runAt: string
  completeness: {
    score: number
    areas: { key: string; name: string; score: number; missing: string[] }[]
  }
  consistency: {
    score: number
    contradictions: { id: string; area1: string; area2: string; description: string }[]
  }
  viability: {
    score: number
    items: { label: string; score: number; detail: string }[]
  }
  risks: {
    score: number
    items: MockRisk[]
  }
}

export interface MockIdea {
  id: string
  name: string
  description: string
  status: IdeaStatus
  origin: string
  createdAt: string
  updatedAt: string
  overallScore: number
  contextAreas: MockContextArea[]
  agentTasks: MockAgentTask[]
  validationReport: MockValidationReport | null
}

// ─── Helpers ───

const _now = Date.now()
const daysAgo = (d: number) => new Date(_now - d * 86400000).toISOString()
const hoursAgo = (h: number) => new Date(_now - h * 3600000).toISOString()

type AreaScores = Partial<Record<string, number>>
type AreaRaw = Partial<Record<string, string>>
type AreaGaps = Partial<Record<string, MockGap[]>>
type AreaUpdated = Partial<Record<string, number>>
type AreaStructured = Partial<Record<string, { title: string; content: string; aiGenerated: boolean }[]>>

function buildContextAreas(
  scores: AreaScores = {},
  rawContents: AreaRaw = {},
  gapsMap: AreaGaps = {},
  updatedMap: AreaUpdated = {},
  structuredMap: AreaStructured = {}
): MockContextArea[] {
  return CONTEXT_AREAS.map((area) => {
    const score = scores[area.key] ?? 0
    return {
      ...area,
      completenessScore: score,
      rawContent: rawContents[area.key] ?? (score > 0 ? 'Raw notes added...' : ''),
      structuredSections: structuredMap[area.key] ?? [],
      hasAiContent: (structuredMap[area.key]?.length ?? 0) > 0,
      lastUpdated:
        updatedMap[area.key] != null ? daysAgo(updatedMap[area.key] as number) : null,
      gaps: gapsMap[area.key] ?? [],
    }
  })
}

// ─── Mock Agent Tasks ───

export const MOCK_AGENT_TASKS: MockAgentTask[] = [
  {
    id: 'agent-001',
    productId: 'trp-001',
    productName: 'TRP — Tax Research Platform',
    contextAreaKey: 'market_competitive_analysis',
    contextAreaName: 'Market & Competitive Analysis',
    agentType: 'Market Analysis',
    status: 'COMPLETED',
    startedAt: hoursAgo(3),
    completedAt: hoursAgo(2),
    error: null,
  },
  {
    id: 'agent-002',
    productId: 'trp-001',
    productName: 'TRP — Tax Research Platform',
    contextAreaKey: 'user_stakeholder_research',
    contextAreaName: 'User & Stakeholder Research',
    agentType: 'User Research Synthesis',
    status: 'RUNNING',
    startedAt: hoursAgo(0.25),
    completedAt: null,
    error: null,
  },
  {
    id: 'agent-003',
    productId: 'meshlink-004',
    productName: 'MeshLink — Network Monitoring',
    contextAreaKey: 'regulatory_domain_context',
    contextAreaName: 'Regulatory & Domain Context',
    agentType: 'Regulatory Scan',
    status: 'FAILED',
    startedAt: daysAgo(2),
    completedAt: daysAgo(2),
    error: 'Rate limit exceeded. Please retry in a few minutes.',
  },
  {
    id: 'agent-004',
    productId: 'draftkit-003',
    productName: 'DraftKit — Proposal Generator',
    contextAreaKey: 'market_competitive_analysis',
    contextAreaName: 'Market & Competitive Analysis',
    agentType: 'Competitive Intelligence',
    status: 'COMPLETED',
    startedAt: daysAgo(5),
    completedAt: daysAgo(5),
    error: null,
  },
]

// ─── Validation report for DraftKit ───

const draftKitReport: MockValidationReport = {
  overallScore: 87,
  runAt: daysAgo(1),
  completeness: {
    score: 91,
    areas: CONTEXT_AREAS.map((area) => ({
      key: area.key,
      name: area.name,
      score:
        ({
          problem_definition: 95,
          user_stakeholder_research: 88,
          market_competitive_analysis: 92,
          regulatory_domain_context: 85,
          business_model_strategy: 90,
          product_vision_roadmap: 94,
          brand_design_direction: 88,
        } as Record<string, number>)[area.key] ?? 88,
      missing: [],
    })),
  },
  consistency: {
    score: 88,
    contradictions: [],
  },
  viability: {
    score: 82,
    items: [
      {
        label: 'Market size',
        score: 85,
        detail: 'Addressable market of $2.3B with clear growth trajectory in professional services AI tools.',
      },
      {
        label: 'Competitive differentiation',
        score: 78,
        detail: 'Strong AI angle but 2 direct competitors exist. Differentiation via deep template library.',
      },
      {
        label: 'Business model feasibility',
        score: 84,
        detail: 'SaaS with proven per-seat metrics in comparable tools. CAC/LTV ratio looks healthy.',
      },
    ],
  },
  risks: {
    score: 80,
    items: [
      {
        category: 'Competitive',
        level: 'medium',
        description: 'Notion AI and ChatGPT entering proposal generation space may commoditise core features.',
      },
      {
        category: 'Technical',
        level: 'low',
        description: 'LLM output quality variance for specialised industries requires ongoing fine-tuning.',
      },
      {
        category: 'Market timing',
        level: 'low',
        description: 'Budget cycles favour annual renewals — long sales ramp expected before predictable MRR.',
      },
    ],
  },
}

// ─── TRP structured content ───

const trpStructured: AreaStructured = {
  problem_definition: [
    {
      title: 'Problem Statement',
      content:
        'Tax professionals at mid-size accounting firms spend 6+ hours per week manually monitoring regulatory updates across fragmented sources — CRA bulletins, provincial directives, court rulings, and interpretation bulletins — with no unified system.',
      aiGenerated: true,
    },
    {
      title: 'Evidence',
      content:
        'Interviews with 3 accounting firms (50–200 staff) confirmed the problem. Industry survey data: 73% of tax professionals cite research overhead as their top operational pain point. Average firm loses ~$50k/year in billable time to duplicate research.',
      aiGenerated: true,
    },
    {
      title: 'Root Cause',
      content:
        'No single source covers all regulatory bodies. Each source has different update cadence, format, and delivery mechanism. Firms rely on email subscriptions and ad-hoc searches — a system designed for manual consumption, not aggregated monitoring.',
      aiGenerated: false,
    },
    {
      title: 'Impact',
      content:
        'Beyond time cost: missed regulatory updates create client liability. Professional negligence risk is disproportionate to the savings from a monitoring tool — making the ROI case very strong.',
      aiGenerated: true,
    },
  ],
  market_competitive_analysis: [
    {
      title: 'Market Overview',
      content:
        'Canadian tax research software market is estimated at ~$180M ARR. The broader North American professional tax research market is $2.1B+. Growth driven by regulatory complexity increasing ~12% YoY.',
      aiGenerated: true,
    },
    {
      title: 'Competitive Landscape',
      content:
        'Tier 1: Westlaw Tax, LexisNexis — comprehensive but priced for BigLaw ($8k–$25k/seat/year). Tier 2: CCH IntelliConnect, TaxNetPro — mid-market, legacy UX, no AI. Gap: No modern, AI-native, Canada-specialist tool under $2k/user/year.',
      aiGenerated: true,
    },
  ],
}

// ─── MOCK_IDEAS ───

export const MOCK_IDEAS: MockIdea[] = [
  {
    id: 'trp-001',
    name: 'TRP — Tax Research Platform',
    description:
      'A unified research platform that aggregates tax regulatory updates, rulings, and guidance for accounting firms — eliminating the 6+ hours per week spent hunting across 12+ sources.',
    status: 'EXPLORING',
    origin: 'Client conversation',
    createdAt: daysAgo(14),
    updatedAt: daysAgo(1),
    overallScore: 24,
    agentTasks: MOCK_AGENT_TASKS.filter((t) => t.productId === 'trp-001'),
    validationReport: null,
    contextAreas: buildContextAreas(
      {
        problem_definition: 72,
        user_stakeholder_research: 45,
        market_competitive_analysis: 30,
        regulatory_domain_context: 15,
        business_model_strategy: 0,
        product_vision_roadmap: 0,
        brand_design_direction: 8,
      },
      {
        problem_definition: `Tax professionals waste an average of 6+ hours per week hunting for regulatory updates across 12+ different sources — CRA updates, provincial bulletins, international treaty changes, court rulings, and interpretation bulletins.\n\nThe core problem is fragmentation. Every source has its own update cadence, format, and delivery mechanism. Most firms rely on email subscriptions, manual bookmarking, and ad-hoc searches. The result: missed updates, duplicate research effort, and inconsistent client advice.\n\nThis is a professional risk problem, not just a time problem. Missing a regulatory change that affects a client's position is a liability issue.`,
        user_stakeholder_research: `Primary users: Tax managers and partners at mid-size accounting firms (50–500 staff). Highly specialised, time-pressed, deeply risk-averse.\n\nKey pain: They've built manual workflows that work but are fragile. Any new tool needs to integrate with their existing research cadence, not replace it.\n\nSecondary: Junior associates doing first-pass research. They want to impress seniors with thoroughness — they'd heavily use a system that surfaces relevant updates automatically.`,
        market_competitive_analysis: `Existing solutions fall into two camps:\n1. Broad legal research tools (Westlaw, LexisNexis) — expensive, comprehensive, not tax-specialist focused\n2. CPA-specific newsletters — curated but not searchable or structured\n\nGap: No tool combines real-time aggregation with semantic search and firm-specific relevance filtering.`,
        regulatory_domain_context: `Key regulatory bodies: CRA (federal), provincial revenue agencies, Tax Court of Canada, OECD.\n\nUpdate frequency: CRA issues guidance daily. Some bulletins supersede others — tracking supersession is a known pain point.`,
        brand_design_direction: `Initial direction: professional, trustworthy, minimal. Bloomberg terminal crossed with modern SaaS. Not flashy — compliance software.`,
      },
      {
        problem_definition: [
          { id: 'g1', title: 'Quantify time savings per firm size', reason: 'Need ROI data to justify pricing', action: 'agent' },
          { id: 'g2', title: 'Define failure modes for missed updates', reason: 'Needed for risk section', action: 'manual' },
        ],
        user_stakeholder_research: [
          { id: 'g3', title: 'Interview 5 tax managers at target firms', reason: 'Validate pain and workflow assumptions', action: 'manual' },
          { id: 'g4', title: 'Map current research workflow in detail', reason: 'Required to identify integration points', action: 'manual' },
          { id: 'g5', title: 'Identify decision-maker vs end-user dynamics', reason: 'Critical for sales and adoption strategy', action: 'agent' },
        ],
        market_competitive_analysis: [
          { id: 'g6', title: 'Pricing analysis of Westlaw and CCH', reason: 'Needed for positioning and pricing strategy', action: 'agent' },
          { id: 'g7', title: 'Identify recent entrants in tax tech', reason: 'Competitive landscape is moving fast', action: 'agent' },
        ],
        business_model_strategy: [
          { id: 'g8', title: 'Define pricing model (per seat vs per firm)', reason: 'Fundamental for financial model', action: 'manual' },
          { id: 'g9', title: 'Estimate CAC and LTV', reason: 'Required for viability assessment', action: 'agent' },
          { id: 'g10', title: 'Draft 3-year financial projections', reason: 'Needed for investor conversations', action: 'agent' },
        ],
        product_vision_roadmap: [
          { id: 'g11', title: 'Define v1 feature scope', reason: 'Prevent scope creep in build phase', action: 'manual' },
          { id: 'g12', title: 'Map 18-month roadmap milestones', reason: 'Needed for investor conversations', action: 'manual' },
        ],
        brand_design_direction: [
          { id: 'g13', title: 'Define visual identity direction', reason: 'Needed before UI design begins', action: 'manual' },
        ],
        regulatory_domain_context: [
          { id: 'g14', title: 'Map data licensing requirements', reason: 'CRA data may have redistribution restrictions', action: 'agent' },
        ],
      },
      {
        problem_definition: 1,
        user_stakeholder_research: 2,
        market_competitive_analysis: 1,
        regulatory_domain_context: 4,
        brand_design_direction: 3,
      },
      trpStructured
    ),
  },
  {
    id: 'pulse-002',
    name: 'Pulse — Team Sentiment Tracker',
    description:
      'Anonymous weekly pulse checks that give managers real signal on team health without the awkwardness of direct 1:1s.',
    status: 'NEW',
    origin: 'Personal frustration',
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
    overallScore: 0,
    agentTasks: [],
    validationReport: null,
    contextAreas: buildContextAreas({}),
  },
  {
    id: 'draftkit-003',
    name: 'DraftKit — Proposal Generator',
    description:
      'AI-powered proposal and SOW generator for agencies and consultancies. Takes a brief, outputs a client-ready document in minutes.',
    status: 'VALIDATED',
    origin: 'Competitive analysis',
    createdAt: daysAgo(45),
    updatedAt: daysAgo(1),
    overallScore: 87,
    agentTasks: MOCK_AGENT_TASKS.filter((t) => t.productId === 'draftkit-003'),
    validationReport: draftKitReport,
    contextAreas: buildContextAreas(
      {
        problem_definition: 95,
        user_stakeholder_research: 88,
        market_competitive_analysis: 92,
        regulatory_domain_context: 85,
        business_model_strategy: 90,
        product_vision_roadmap: 94,
        brand_design_direction: 88,
      },
      {},
      {},
      {
        problem_definition: 6,
        user_stakeholder_research: 8,
        market_competitive_analysis: 5,
        regulatory_domain_context: 12,
        business_model_strategy: 7,
        product_vision_roadmap: 3,
        brand_design_direction: 10,
      }
    ),
  },
  {
    id: 'meshlink-004',
    name: 'MeshLink — Network Monitoring',
    description:
      'Distributed network monitoring for SMBs. Think Datadog but priced and scoped for 50-person companies.',
    status: 'ARCHIVED',
    origin: 'Industry trend',
    createdAt: daysAgo(30),
    updatedAt: daysAgo(10),
    overallScore: 23,
    agentTasks: MOCK_AGENT_TASKS.filter((t) => t.productId === 'meshlink-004'),
    validationReport: null,
    contextAreas: buildContextAreas(
      {
        problem_definition: 65,
        user_stakeholder_research: 30,
        market_competitive_analysis: 20,
        regulatory_domain_context: 0,
        business_model_strategy: 10,
        product_vision_roadmap: 0,
        brand_design_direction: 0,
      },
      {},
      {},
      {
        problem_definition: 11,
        user_stakeholder_research: 14,
        market_competitive_analysis: 15,
        business_model_strategy: 20,
      }
    ),
  },
  {
    id: 'quill-005',
    name: 'Quill — AI Writing Coach',
    description:
      'Real-time writing coach that improves clarity, tone, and structure as you write — positioned for professional communications.',
    status: 'DISMISSED',
    origin: 'Market research',
    createdAt: daysAgo(60),
    updatedAt: daysAgo(55),
    overallScore: 12,
    agentTasks: [],
    validationReport: null,
    contextAreas: buildContextAreas(
      {
        problem_definition: 55,
        user_stakeholder_research: 20,
        market_competitive_analysis: 15,
        regulatory_domain_context: 0,
        business_model_strategy: 0,
        product_vision_roadmap: 0,
        brand_design_direction: 0,
      }
    ),
  },
]

// ─── Lookup helpers ───

export function getIdeaById(id: string): MockIdea | undefined {
  return MOCK_IDEAS.find((i) => i.id === id)
}

export function getContextArea(idea: MockIdea, areaKeyOrUrl: string): MockContextArea | undefined {
  const normalized = areaKeyOrUrl.replace(/-/g, '_')
  return idea.contextAreas.find((a) => a.key === normalized)
}

export function areaKeyToUrl(key: string): string {
  return key.replace(/_/g, '-')
}

export function urlToAreaKey(url: string): string {
  return url.replace(/-/g, '_')
}

export function formatRelativeDate(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diffMs / 60000)
  const hours = Math.floor(diffMs / 3600000)
  const days = Math.floor(diffMs / 86400000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return '1 day ago'
  if (days < 7) return `${days} days ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
