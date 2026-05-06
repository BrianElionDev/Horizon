import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { supabase } from '../../lib/supabase'
import { authenticate } from '../../middleware/authenticate'
import { forgeChat } from '../../lib/forge'
import { AREA_PROMPTS } from '../../lib/area-prompts'
import { jsonrepair } from 'jsonrepair'
import { CONTEXT_AREAS } from '@horizon/shared'
import type { ContextAreaContent, ContextAreaSummary, Idea } from '@horizon/shared'
import type { IdeaRow, ContextAreaContentRow } from '../../types/database'

const VALID_AREA_KEYS: ReadonlySet<string> = new Set(CONTEXT_AREAS.map((a) => a.key))

function toIdea(row: IdeaRow): Idea {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    status: row.status,
    origin: row.origin,
    userId: row.user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastAnalysis: row.last_analysis,
    lastAnalysedAt: row.last_analysed_at,
    rawNotes: row.raw_notes,
  }
}

function toSummary(row: Pick<ContextAreaContentRow, 'area_key' | 'completeness' | 'updated_at'>): ContextAreaSummary {
  return {
    areaKey: row.area_key,
    completeness: row.completeness,
    updatedAt: row.updated_at,
  }
}

function toContent(row: ContextAreaContentRow): ContextAreaContent {
  return {
    areaKey: row.area_key,
    rawContent: row.raw_content,
    sections: (row.sections ?? []) as ContextAreaContent['sections'],
    completeness: row.completeness,
    structuredAt: row.structured_at,
    updatedAt: row.updated_at,
  }
}

function emptyContent(areaKey: string): ContextAreaContent {
  return { areaKey, rawContent: '', sections: [], completeness: 0, structuredAt: null, updatedAt: null }
}

function meta() {
  return { timestamp: new Date().toISOString() }
}

const createIdeaSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(2000).optional(),
  origin: z.string().max(200).optional(),
})

const saveAreaSchema = z.object({
  rawContent: z.string().max(50000),
})

const reviewSectionSchema = z.object({
  status: z.enum(['accepted', 'rejected', 'pending']),
  content: z.string().max(10000).optional(),
})

const ideasRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /ideas
  fastify.get('/ideas', { preHandler: authenticate }, async (request, reply) => {
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .eq('user_id', request.user!.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return reply.send({ data: (data ?? []).map(toIdea), meta: meta() })
  })

  // GET /ideas/:id
  fastify.get('/ideas/:id', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const { data: idea, error } = await supabase
      .from('ideas')
      .select('*')
      .eq('id', id)
      .eq('user_id', request.user!.id)
      .single()

    if (error || !idea) {
      return reply.status(404).send({
        error: { code: 'NOT_FOUND', message: 'Idea not found', statusCode: 404 },
      })
    }

    return reply.send({ data: toIdea(idea as IdeaRow), meta: meta() })
  })

  // POST /ideas
  fastify.post('/ideas', { preHandler: authenticate }, async (request, reply) => {
    const result = createIdeaSchema.safeParse(request.body)
    if (!result.success) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message, statusCode: 400 },
      })
    }

    const { data, error } = await supabase
      .from('ideas')
      .insert({
        name: result.data.name,
        description: result.data.description ?? null,
        origin: result.data.origin ?? null,
        user_id: request.user!.id,
        status: 'NEW',
      })
      .select()
      .single()

    if (error) throw error
    return reply.status(201).send({ data: toIdea(data as IdeaRow), meta: meta() })
  })

  // GET /ideas/:id/context  — completeness summaries for all saved areas
  fastify.get('/ideas/:id/context', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const { error: ideaError } = await supabase
      .from('ideas')
      .select('id')
      .eq('id', id)
      .eq('user_id', request.user!.id)
      .single()

    if (ideaError) {
      return reply.status(404).send({
        error: { code: 'NOT_FOUND', message: 'Idea not found', statusCode: 404 },
      })
    }

    const { data, error } = await supabase
      .from('context_area_content')
      .select('area_key, completeness, updated_at')
      .eq('idea_id', id)

    if (error) throw error

    const summaries: ContextAreaSummary[] = (data ?? []).map(toSummary)
    return reply.send({ data: summaries, meta: meta() })
  })

  // GET /ideas/:id/context/:areaKey  — full content for one area
  fastify.get('/ideas/:id/context/:areaKey', { preHandler: authenticate }, async (request, reply) => {
    const { id, areaKey } = request.params as { id: string; areaKey: string }

    if (!VALID_AREA_KEYS.has(areaKey)) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_ERROR', message: 'Invalid context area key', statusCode: 400 },
      })
    }

    const { error: ideaError } = await supabase
      .from('ideas')
      .select('id')
      .eq('id', id)
      .eq('user_id', request.user!.id)
      .single()

    if (ideaError) {
      return reply.status(404).send({
        error: { code: 'NOT_FOUND', message: 'Idea not found', statusCode: 404 },
      })
    }

    const { data, error } = await supabase
      .from('context_area_content')
      .select('*')
      .eq('idea_id', id)
      .eq('area_key', areaKey)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    return reply.send({
      data: data ? toContent(data as ContextAreaContentRow) : emptyContent(areaKey),
      meta: meta(),
    })
  })

  // PATCH /ideas/:id/context/:areaKey  — upsert raw content
  fastify.patch('/ideas/:id/context/:areaKey', { preHandler: authenticate }, async (request, reply) => {
    const { id, areaKey } = request.params as { id: string; areaKey: string }

    if (!VALID_AREA_KEYS.has(areaKey)) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_ERROR', message: 'Invalid context area key', statusCode: 400 },
      })
    }

    const result = saveAreaSchema.safeParse(request.body)
    if (!result.success) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message, statusCode: 400 },
      })
    }

    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('id, status')
      .eq('id', id)
      .eq('user_id', request.user!.id)
      .single()

    if (ideaError || !idea) {
      return reply.status(404).send({
        error: { code: 'NOT_FOUND', message: 'Idea not found', statusCode: 404 },
      })
    }

    const rawContent = result.data.rawContent
    const completeness = Math.min(100, Math.round((rawContent.trim().length / 2000) * 100))
    const now = new Date().toISOString()

    const { error: upsertError } = await supabase
      .from('context_area_content')
      .upsert(
        { idea_id: id, area_key: areaKey, raw_content: rawContent, completeness, updated_at: now },
        { onConflict: 'idea_id,area_key' }
      )

    if (upsertError) throw upsertError

    if ((idea as IdeaRow).status === 'NEW' && rawContent.trim().length > 0) {
      await supabase
        .from('ideas')
        .update({ status: 'EXPLORING', updated_at: now })
        .eq('id', id)
    }

    return reply.send({ data: { areaKey, completeness, updatedAt: now }, meta: meta() })
  })

  // POST /ideas/:id/context/:areaKey/structure  — AI structures raw content into sections
  fastify.post('/ideas/:id/context/:areaKey/structure', { preHandler: authenticate }, async (request, reply) => {
    const { id, areaKey } = request.params as { id: string; areaKey: string }

    if (!VALID_AREA_KEYS.has(areaKey)) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_ERROR', message: 'Invalid context area key', statusCode: 400 },
      })
    }

    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('name')
      .eq('id', id)
      .eq('user_id', request.user!.id)
      .single()

    if (ideaError || !idea) {
      return reply.status(404).send({
        error: { code: 'NOT_FOUND', message: 'Idea not found', statusCode: 404 },
      })
    }

    const { data: areaRow } = await supabase
      .from('context_area_content')
      .select('raw_content')
      .eq('idea_id', id)
      .eq('area_key', areaKey)
      .single()

    const rawContent = areaRow?.raw_content ?? ''
    if (!rawContent.trim()) {
      return reply.status(400).send({
        error: { code: 'NO_CONTENT', message: 'Add raw content before structuring', statusCode: 400 },
      })
    }

    const areaMeta = CONTEXT_AREAS.find((a) => a.key === areaKey)!
    const prompt = AREA_PROMPTS[areaKey]

    const response = await forgeChat(
      [
        {
          role: 'system',
          content: prompt
            ? prompt.system
            : `You are a structured data extraction assistant for Horizon, a product discovery system. You always respond with a valid JSON array only — no markdown fences, no explanation, just the raw JSON array.`,
        },
        {
          role: 'user',
          content: prompt
            ? prompt.userTemplate(idea.name, rawContent)
            : `Structure these raw notes for the "${areaMeta.name}" context area of "${idea.name}". Return a JSON array of 3–5 sections.\n\nRaw notes:\n"""\n${rawContent}\n"""\n\n[{ "title": "...", "content": "..." }, ...]`,
        },
      ],
      6000
    )

    // Strip <think>...</think> blocks (Qwen 3 extended thinking)
    // Strip markdown code fences (model sometimes wraps JSON in ```json ... ```)
    const cleaned = response
      .replace(/<think>[\s\S]*?<\/think>/gi, '')
      .replace(/```(?:json)?\s*([\s\S]*?)```/g, '$1')
      .trim()

    let parsed: { title: string; content: string }[] = []
    try {
      // jsonrepair closes truncated arrays/strings so partial responses still parse
      const repaired = jsonrepair(cleaned)
      const result = JSON.parse(repaired)
      parsed = Array.isArray(result) ? result : []
    } catch {
      if (cleaned) parsed = [{ title: areaMeta.name, content: cleaned }]
    }

    const now = new Date().toISOString()
    const sections = parsed
      .filter((s) => s.title && s.content)
      .map((s) => ({
        id: crypto.randomUUID(),
        title: s.title,
        content: s.content,
        aiGenerated: true,
        status: 'pending' as const,
        updatedAt: now,
      }))

    const { error: updateError } = await supabase
      .from('context_area_content')
      .update({ sections, structured_at: now, updated_at: now })
      .eq('idea_id', id)
      .eq('area_key', areaKey)

    if (updateError) throw updateError

    return reply.send({ data: { sections, structuredAt: now }, meta: meta() })
  })

  // PATCH /ideas/:id/context/:areaKey/sections/:sectionId  — accept / reject / edit a section
  fastify.patch('/ideas/:id/context/:areaKey/sections/:sectionId', { preHandler: authenticate }, async (request, reply) => {
    const { id, areaKey, sectionId } = request.params as { id: string; areaKey: string; sectionId: string }

    if (!VALID_AREA_KEYS.has(areaKey)) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_ERROR', message: 'Invalid context area key', statusCode: 400 },
      })
    }

    const result = reviewSectionSchema.safeParse(request.body)
    if (!result.success) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message, statusCode: 400 },
      })
    }

    const { error: ideaError } = await supabase
      .from('ideas')
      .select('id')
      .eq('id', id)
      .eq('user_id', request.user!.id)
      .single()

    if (ideaError) {
      return reply.status(404).send({
        error: { code: 'NOT_FOUND', message: 'Idea not found', statusCode: 404 },
      })
    }

    const { data: areaRow, error: fetchError } = await supabase
      .from('context_area_content')
      .select('sections')
      .eq('idea_id', id)
      .eq('area_key', areaKey)
      .single()

    if (fetchError || !areaRow) {
      return reply.status(404).send({
        error: { code: 'NOT_FOUND', message: 'Context area not found', statusCode: 404 },
      })
    }

    const sections = (areaRow.sections ?? []) as ContextAreaContent['sections']
    const idx = sections.findIndex((s) => s.id === sectionId)

    if (idx === -1) {
      return reply.status(404).send({
        error: { code: 'NOT_FOUND', message: 'Section not found', statusCode: 404 },
      })
    }

    const now = new Date().toISOString()
    sections[idx] = {
      ...sections[idx],
      status: result.data.status,
      ...(result.data.content !== undefined ? { content: result.data.content, aiGenerated: false } : {}),
      updatedAt: now,
    }

    const { error: updateError } = await supabase
      .from('context_area_content')
      .update({ sections, updated_at: now })
      .eq('idea_id', id)
      .eq('area_key', areaKey)

    if (updateError) throw updateError

    return reply.send({ data: sections[idx], meta: meta() })
  })

  // POST /ideas/:id/structure-all  — one raw dump → Forge structures all 7 areas in parallel
  fastify.post('/ideas/:id/structure-all', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const result = saveAreaSchema.safeParse(request.body)
    if (!result.success) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message, statusCode: 400 },
      })
    }
    const { rawContent } = result.data

    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('id, name')
      .eq('id', id)
      .eq('user_id', request.user!.id)
      .single()

    if (ideaError || !idea) {
      return reply.status(404).send({
        error: { code: 'NOT_FOUND', message: 'Idea not found', statusCode: 404 },
      })
    }

    const areaKeys = [...VALID_AREA_KEYS]
    const now = new Date().toISOString()

    // Fetch previous raw_notes and existing structured sections before overwriting anything
    const [{ data: ideaFull }, { data: existingAreas }] = await Promise.all([
      supabase.from('ideas').select('raw_notes').eq('id', id).single(),
      supabase.from('context_area_content').select('area_key, sections').eq('idea_id', id),
    ])

    const previousRawNotes: string | null = (ideaFull as { raw_notes: string | null } | null)?.raw_notes ?? null
    const existingSectionsByKey: Record<string, { title: string; content: string }[]> = {}
    for (const row of existingAreas ?? []) {
      const sections = Array.isArray(row.sections) ? row.sections as { title: string; content: string }[] : []
      if (sections.length > 0) existingSectionsByKey[row.area_key] = sections
    }

    // Persist the raw dump on the idea itself so setup can pre-fill it next time
    await supabase
      .from('ideas')
      .update({ raw_notes: rawContent, updated_at: now })
      .eq('id', id)

    // Upsert raw content for all 7 areas before structuring
    await Promise.all(
      areaKeys.map((areaKey) =>
        supabase.from('context_area_content').upsert(
          { idea_id: id, area_key: areaKey, raw_content: rawContent, updated_at: now },
          { onConflict: 'idea_id,area_key' }
        )
      )
    )

    // Run Forge for all areas in parallel — a failed area doesn't block the others
    const settled = await Promise.allSettled(
      areaKeys.map(async (areaKey) => {
        const areaMeta = CONTEXT_AREAS.find((a) => a.key === areaKey)!
        const prompt = AREA_PROMPTS[areaKey]

        const baseUserMessage = prompt
          ? prompt.userTemplate(idea.name, rawContent)
          : `Structure these raw notes for the "${areaMeta.name}" context area of "${idea.name}". Return a JSON array of 3–5 sections.\n\nRaw notes:\n"""\n${rawContent}\n"""\n\n[{ "title": "...", "content": "..." }, ...]`

        // Append previous context when available so Forge improves rather than regenerates
        const prevSections = existingSectionsByKey[areaKey]
        const contextSuffix = [
          prevSections?.length
            ? `---\nPREVIOUS ANALYSIS for this area — build on these, keep accurate insights, update anything the new notes correct or expand, fill any gaps:\n${JSON.stringify(prevSections, null, 2)}`
            : null,
          previousRawNotes && previousRawNotes !== rawContent
            ? `---\nPREVIOUS RAW NOTES (background context from earlier session):\n"""\n${previousRawNotes}\n"""`
            : null,
        ]
          .filter(Boolean)
          .join('\n\n')

        const userMessage = contextSuffix ? `${baseUserMessage}\n\n${contextSuffix}` : baseUserMessage

        const response = await forgeChat(
          [
            {
              role: 'system',
              content: prompt?.system ?? `You are a structured data extraction assistant for Horizon. Respond with a valid JSON array only.`,
            },
            {
              role: 'user',
              content: userMessage,
            },
          ],
          5000
        )

        const cleaned = response
          .replace(/<think>[\s\S]*?<\/think>/gi, '')
          .replace(/```(?:json)?\s*([\s\S]*?)```/g, '$1')
          .trim()

        let parsed: { title: string; content: string }[] = []
        try {
          const repaired = jsonrepair(cleaned)
          const arr = JSON.parse(repaired)
          parsed = Array.isArray(arr) ? arr : []
        } catch {
          if (cleaned) parsed = [{ title: areaMeta.name, content: cleaned }]
        }

        const sections = parsed
          .filter((s) => s.title && s.content)
          .map((s) => ({
            id: crypto.randomUUID(),
            title: s.title,
            content: s.content,
            aiGenerated: true,
            status: 'pending' as const,
            updatedAt: now,
          }))

        await supabase
          .from('context_area_content')
          .update({ sections, structured_at: now, updated_at: now })
          .eq('idea_id', id)
          .eq('area_key', areaKey)

        return { areaKey, sectionCount: sections.length }
      })
    )

    const results = settled.map((r, i) => ({
      areaKey: areaKeys[i],
      status: r.status === 'fulfilled' ? 'ok' : 'failed',
      sectionCount: r.status === 'fulfilled' ? r.value.sectionCount : 0,
    }))

    return reply.send({ data: { results }, meta: meta() })
  })

  // POST /ideas/:id/analyse
  fastify.post('/ideas/:id/analyse', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const { data: idea, error } = await supabase
      .from('ideas')
      .select('*')
      .eq('id', id)
      .eq('user_id', request.user!.id)
      .single()

    if (error || !idea) {
      return reply.status(404).send({
        error: { code: 'NOT_FOUND', message: 'Idea not found', statusCode: 404 },
      })
    }

    const areaList = CONTEXT_AREAS.map((a) => `- ${a.name}: ${a.description}`).join('\n')

    const analysis = await forgeChat([
      {
        role: 'system',
        content: `You are a senior product strategist for Horizon, a strategic product discovery system. Your job is to give sharp, actionable analysis of early-stage product ideas. Be direct. No filler. Brian is a solo founder who needs to know what to do next, not a lecture on product strategy.`,
      },
      {
        role: 'user',
        content: `Analyse this product idea:

**Name:** ${idea.name}
**Description:** ${idea.description ?? 'Not provided'}
**Origin:** ${idea.origin ?? 'Not provided'}

Provide a structured analysis using exactly these four sections:

## Initial Assessment
What's genuinely promising here? What's unclear, weak, or assumed without evidence? (2–3 sharp sentences)

## Context Area Readiness
For each area, give: current state (Unknown / Partial / Clear) — one specific next action to advance it.
${areaList}

## Recommended First Move
The single most important thing to do in the next 48 hours to validate or kill this idea. Name a specific action — a person to call, a search to run, a doc to write.

## Early Risks
Up to 3 assumptions that, if wrong, would kill this idea. One sentence each.`,
      },
    ])

    const analysedAt = new Date().toISOString()
    await supabase
      .from('ideas')
      .update({ last_analysis: analysis, last_analysed_at: analysedAt })
      .eq('id', id)

    return reply.send({ data: { analysis, analysedAt }, meta: meta() })
  })
}

export default ideasRoutes
