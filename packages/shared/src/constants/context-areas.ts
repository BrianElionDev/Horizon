export const CONTEXT_AREAS = [
  {
    key: 'problem_definition',
    name: 'Problem Definition',
    description: 'Establish that a real, significant problem exists and articulate it precisely.',
    order: 1,
  },
  {
    key: 'user_stakeholder_research',
    name: 'User & Stakeholder Research',
    description: 'Deeply understand every person who will interact with or be affected by the product.',
    order: 2,
  },
  {
    key: 'market_competitive_analysis',
    name: 'Market & Competitive Analysis',
    description: 'Understand the competitive landscape, existing solutions, and market gaps.',
    order: 3,
  },
  {
    key: 'regulatory_domain_context',
    name: 'Regulatory & Domain Context',
    description: 'Identify every constraint that shapes what the product can and cannot do.',
    order: 4,
  },
  {
    key: 'business_model_strategy',
    name: 'Business Model & Strategy',
    description: 'Confirm the product can become a viable business.',
    order: 5,
  },
  {
    key: 'product_vision_roadmap',
    name: 'Product Vision & Roadmap',
    description: 'Define what the product looks like at maturity and the path to get there.',
    order: 6,
  },
  {
    key: 'brand_design_direction',
    name: 'Brand & Design Direction',
    description: 'Establish identity and visual language.',
    order: 7,
  },
] as const

export type ContextAreaKey = (typeof CONTEXT_AREAS)[number]['key']
