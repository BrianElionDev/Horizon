interface AreaPrompt {
  system: string
  userTemplate: (productName: string, rawContent: string) => string
}

const JSON_FORMAT = `The "content" field must use markdown: use **bold** for key terms, bullet lists for multiple items, and short paragraphs for prose. Do not use headings inside content. Return a valid JSON array only — no other text.

[{ "title": "...", "content": "markdown string" }, ...]`

export const AREA_PROMPTS: Record<string, AreaPrompt> = {
  problem_definition: {
    system: `You are a product strategist specialising in problem validation. You take raw founder notes and sharpen them into precise, evidence-backed problem definitions. You distinguish real pain from assumed pain. You write content in markdown — bold for key terms, bullets for lists. You always respond with a valid JSON array only, no explanation.`,
    userTemplate: (name, raw) => `/nothink
Structure these raw notes for the Problem Definition context area of "${name}".

Sections to extract (use these exact titles, omit any with no supporting evidence):
1. "Core Problem Statement" — sharp paragraph: the problem, who has it, why it matters. Bold the core pain point.
2. "Who It Affects" — bullet list of affected groups with context on how each is impacted
3. "Evidence & Signals" — bullet list of concrete signals: quotes, observed behaviours, workarounds
4. "Current Workarounds" — what people do today and why each falls short
5. "Why Now" — what has changed (technology, market, behaviour) that makes this the right moment

Raw notes:
"""
${raw}
"""

${JSON_FORMAT}`,
  },

  user_stakeholder_research: {
    system: `You are a UX researcher synthesising user research notes into structured insights. You separate user segments from stakeholders, surface non-obvious patterns, and flag assumptions. You write content in markdown — bold for key terms, bullets for lists. You always respond with a valid JSON array only, no explanation.`,
    userTemplate: (name, raw) => `/nothink
Structure these raw notes for the User & Stakeholder Research context area of "${name}".

Sections to extract (omit any with no supporting content):
1. "User Segments" — bullet list: each segment, their role, context, and what makes them distinct
2. "Key Pain Points" — bullet list per segment or theme: specific frustrations and unmet needs
3. "Behavioural Patterns" — how users currently work, what tools they use, how they cope with the problem
4. "Stakeholder Map" — bullet list: who influences adoption, procurement, or usage but isn't the end user
5. "Standout Insights" — the most surprising or non-obvious things from research. Bold each insight.

Raw notes:
"""
${raw}
"""

${JSON_FORMAT}`,
  },

  market_competitive_analysis: {
    system: `You are a market analyst and competitive intelligence expert. You turn raw research into sharp competitive landscape analysis. You name competitors specifically, identify genuine whitespace, and avoid wishful thinking. You write content in markdown — bold competitor names and key terms, bullets for lists. You always respond with a valid JSON array only, no explanation.`,
    userTemplate: (name, raw) => `/nothink
Structure these raw notes for the Market & Competitive Analysis context area of "${name}".

Sections to extract (omit any with no substantive content):
1. "Competitive Landscape" — bullet list: each competitor, what they do well, where they fall short
2. "Market Opportunity" — size, growth, segments. Be specific with any numbers mentioned.
3. "Whitespace & Gaps" — what no current solution adequately addresses, and why. Bold each gap.
4. "Positioning Opportunity" — how this product can credibly differentiate. Be specific.
5. "Market Trends" — bullet list: forces supporting or threatening this market

Raw notes:
"""
${raw}
"""

${JSON_FORMAT}`,
  },

  regulatory_domain_context: {
    system: `You are a product counsel and domain expert. You extract every constraint — legal, regulatory, technical, contractual — that shapes what a product can and cannot do. You flag severity clearly. You write content in markdown — bold regulations and risk items, bullets for lists. You always respond with a valid JSON array only, no explanation.`,
    userTemplate: (name, raw) => `/nothink
Structure these raw notes for the Regulatory & Domain Context area of "${name}".

Sections to extract (omit any with no supporting content):
1. "Hard Constraints" — bullet list: non-negotiable laws/rules (GDPR, HIPAA, ToS). Bold each regulation name.
2. "Compliance Requirements" — what the product must do to operate legally in each target market
3. "Risk Areas" — bullet list: where legal position is unclear. Bold each risk. Note severity.
4. "Technical & Platform Limits" — constraints from APIs, browser policies, app stores, infrastructure
5. "Domain-Specific Rules" — industry norms or sector-specific expectations that constrain design

Raw notes:
"""
${raw}
"""

${JSON_FORMAT}`,
  },

  business_model_strategy: {
    system: `You are a startup strategist and business model expert. You extract how a product makes money, reaches customers, and whether the economics hold. You are direct about risks. You write content in markdown — bold pricing tiers and key metrics, bullets for lists. You always respond with a valid JSON array only, no explanation.`,
    userTemplate: (name, raw) => `/nothink
Structure these raw notes for the Business Model & Strategy context area of "${name}".

Sections to extract (omit any with no supporting content):
1. "Revenue Model" — pricing tiers, what each includes, the rationale. Use bullets for each tier, bold the tier names.
2. "Distribution Strategy" — channels, go-to-market motion, growth levers. Bullet list.
3. "Unit Economics" — CAC, LTV, payback period, margin assumptions. Use whatever numbers appear in the notes.
4. "Key Metrics" — bullet list of the numbers that determine if this business is working. Bold each metric.
5. "Strategic Risks" — bullet list: assumptions that, if wrong, break the economics. Bold each assumption.

Raw notes:
"""
${raw}
"""

If numbers are missing, note the gap explicitly rather than inventing figures.

${JSON_FORMAT}`,
  },

  product_vision_roadmap: {
    system: `You are a product director extracting vision and execution roadmap from raw notes. You separate long-term vision from near-term phases. You think in shipped increments, not feature lists. You write content in markdown — bold phase names and milestones, bullets for lists. You always respond with a valid JSON array only, no explanation.`,
    userTemplate: (name, raw) => `/nothink
Structure these raw notes for the Product Vision & Roadmap context area of "${name}".

Sections to extract (omit any with no supporting content):
1. "Vision Statement" — 2–3 sharp sentences on what this product looks like at full maturity
2. "Phases & Milestones" — bullet list: **Phase N** — what ships, what it unlocks. Concrete shipped states.
3. "MVP Scope" — bullet list: what must be true for v1 to be worth shipping
4. "Explicit Non-Goals" — bullet list: what the product will not do and why that boundary exists
5. "Dependencies & Risks" — bullet list: what must be true (technical, market, team) for the roadmap to hold

Raw notes:
"""
${raw}
"""

${JSON_FORMAT}`,
  },

  brand_design_direction: {
    system: `You are a brand strategist and product designer extracting positioning, tone, and design direction from raw notes. You surface concrete identity decisions, not vague descriptors. "Clean and minimal" is not a direction — specific choices are. You write content in markdown — bold key decisions, bullets for lists. You always respond with a valid JSON array only, no explanation.`,
    userTemplate: (name, raw) => `/nothink
Structure these raw notes for the Brand & Design Direction context area of "${name}".

Sections to extract (omit any with no supporting content):
1. "Positioning & Tone" — how the product presents itself, what emotional register it uses, what it explicitly is not. Bold the positioning statement.
2. "Naming & Nomenclature" — name rationale, feature naming conventions, vocabulary to use and avoid
3. "Visual Direction" — bullet list: colour approach, typography, layout principles, the feeling the UI creates
4. "Design Principles" — bullet list: the rules that govern decisions. Bold each principle.
5. "Anti-Patterns" — bullet list: specific things to avoid — clichés, overused patterns, competitor conventions to reject

Raw notes:
"""
${raw}
"""

${JSON_FORMAT}`,
  },
}

/* ── Gap identification prompts ───────────────────────────────────── */

type GapSection = { title: string; content: string; status: string }

interface GapPrompt {
  system: string
  userTemplate: (productName: string, sections: GapSection[], rawContent: string) => string
}

const GAP_FORMAT = `Return a JSON array of gaps (max 5). Each gap: {"title": "what's missing", "reason": "why it matters", "action": "manual" | "agent"}. "agent" = AI can draft from existing hints. "manual" = requires real-world research/interviews. Only include gaps that are genuinely missing or severely thin (<80 chars).`

function sectionsSummary(sections: GapSection[]): string {
  if (sections.length === 0) return '(none)'
  return sections.map(s => `- [${s.status}] "${s.title}" (${s.content.length} chars): ${s.content.slice(0, 200)}`).join('\n')
}

export const GAP_PROMPTS: Record<string, GapPrompt> = {
  problem_definition: {
    system: `You identify specific gaps in a product problem definition. You compare existing content against what a thorough problem definition requires.`,
    userTemplate: (name, sections, raw) => `/nothink
Analyze the Problem Definition for "${name}" and identify what is missing or weak.

Expected coverage: Core Problem Statement, Who It Affects, Evidence & Signals, Current Workarounds, Why Now.

Existing sections:
${sectionsSummary(sections)}

Raw content (first 1500 chars):
${raw.slice(0, 1500)}

${GAP_FORMAT}`,
  },

  user_stakeholder_research: {
    system: `You identify specific gaps in user and stakeholder research. You compare existing content against what thorough user research requires.`,
    userTemplate: (name, sections, raw) => `/nothink
Analyze the User & Stakeholder Research for "${name}" and identify what is missing or weak.

Expected coverage: User Segments, Key Pain Points, Behavioural Patterns, Stakeholder Map, Standout Insights.

Existing sections:
${sectionsSummary(sections)}

Raw content (first 1500 chars):
${raw.slice(0, 1500)}

${GAP_FORMAT}`,
  },

  market_competitive_analysis: {
    system: `You identify specific gaps in market and competitive analysis. You compare existing content against what a thorough competitive landscape requires.`,
    userTemplate: (name, sections, raw) => `/nothink
Analyze the Market & Competitive Analysis for "${name}" and identify what is missing or weak.

Expected coverage: Competitive Landscape, Market Opportunity, Whitespace & Gaps, Positioning Opportunity, Market Trends.

Existing sections:
${sectionsSummary(sections)}

Raw content (first 1500 chars):
${raw.slice(0, 1500)}

${GAP_FORMAT}`,
  },

  regulatory_domain_context: {
    system: `You identify specific gaps in regulatory and domain context analysis. You compare existing content against what a thorough constraint analysis requires.`,
    userTemplate: (name, sections, raw) => `/nothink
Analyze the Regulatory & Domain Context for "${name}" and identify what is missing or weak.

Expected coverage: Hard Constraints, Compliance Requirements, Risk Areas, Technical & Platform Limits, Domain-Specific Rules.

Existing sections:
${sectionsSummary(sections)}

Raw content (first 1500 chars):
${raw.slice(0, 1500)}

${GAP_FORMAT}`,
  },

  business_model_strategy: {
    system: `You identify specific gaps in business model and strategy analysis. You compare existing content against what a viable business model definition requires.`,
    userTemplate: (name, sections, raw) => `/nothink
Analyze the Business Model & Strategy for "${name}" and identify what is missing or weak.

Expected coverage: Revenue Model, Distribution Strategy, Unit Economics, Key Metrics, Strategic Risks.

Existing sections:
${sectionsSummary(sections)}

Raw content (first 1500 chars):
${raw.slice(0, 1500)}

${GAP_FORMAT}`,
  },

  product_vision_roadmap: {
    system: `You identify specific gaps in product vision and roadmap definition. You compare existing content against what a clear product direction requires.`,
    userTemplate: (name, sections, raw) => `/nothink
Analyze the Product Vision & Roadmap for "${name}" and identify what is missing or weak.

Expected coverage: Vision Statement, Phases & Milestones, MVP Scope, Explicit Non-Goals, Dependencies & Risks.

Existing sections:
${sectionsSummary(sections)}

Raw content (first 1500 chars):
${raw.slice(0, 1500)}

${GAP_FORMAT}`,
  },

  brand_design_direction: {
    system: `You identify specific gaps in brand and design direction. You compare existing content against what a clear brand identity requires.`,
    userTemplate: (name, sections, raw) => `/nothink
Analyze the Brand & Design Direction for "${name}" and identify what is missing or weak.

Expected coverage: Positioning & Tone, Naming & Nomenclature, Visual Direction, Design Principles, Anti-Patterns.

Existing sections:
${sectionsSummary(sections)}

Raw content (first 1500 chars):
${raw.slice(0, 1500)}

${GAP_FORMAT}`,
  },
}
