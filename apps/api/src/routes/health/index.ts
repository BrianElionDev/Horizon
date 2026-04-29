import type { FastifyPluginAsync } from 'fastify'
import { supabase } from '../../lib/supabase'

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/health', async (_request, reply) => {
    let dbStatus = 'connected'
    try {
      const { error } = await supabase.from('users').select('id').limit(1)
      if (error) dbStatus = 'error'
    } catch {
      dbStatus = 'error'
    }

    return reply.send({
      data: {
        status: 'ok',
        database: dbStatus,
        timestamp: new Date().toISOString(),
      },
      meta: { timestamp: new Date().toISOString() },
    })
  })
}

export default healthRoutes
