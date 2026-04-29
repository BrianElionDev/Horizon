import type { FastifyPluginAsync } from 'fastify'
import { randomBytes } from 'crypto'
import { supabase } from '../../lib/supabase'
import { verifyPassword } from '../../lib/password'
import { signAccessToken } from '../../lib/jwt'
import { UnauthorizedError } from '../../lib/errors'
import { authenticate } from '../../middleware/authenticate'
import { loginSchema } from '@horizon/shared'
import type { UserRow, SessionWithUser } from '../../types/database'

const REFRESH_COOKIE = 'refreshToken'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60,
}


function meta() {
  return { timestamp: new Date().toISOString() }
}

const authRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /auth/login
  fastify.post(
    '/auth/login',
    { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } },
    async (request, reply) => {
      const result = loginSchema.safeParse(request.body)
      if (!result.success) {
        return reply.status(400).send({
          error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message, statusCode: 400 },
        })
      }

      const { email, password } = result.data

      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single() as { data: UserRow | null }

      if (!user) throw new UnauthorizedError('Invalid email or password')

      const valid = await verifyPassword(password, user.password_hash)
      if (!valid) throw new UnauthorizedError('Invalid email or password')

      const accessToken = signAccessToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      })

      const refreshToken = randomBytes(64).toString('hex')
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

      await supabase.from('sessions').insert({
        user_id: user.id,
        token: refreshToken,
        expires_at: expiresAt,
      })

      reply.setCookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTIONS)

      return reply.send({
        data: { 
          accessToken, 
          user: { id: user.id, email: user.email, name: user.name, role: user.role } 
        },
        meta: meta(),
      })

    }
  )

  // POST /auth/refresh
  fastify.post('/auth/refresh', async (request, reply) => {
    const token = request.cookies[REFRESH_COOKIE]
    if (!token) throw new UnauthorizedError('No refresh token')

    const { data: session } = await supabase
      .from('sessions')
      .select('*, users(*)')
      .eq('token', token)
      .single() as { data: SessionWithUser | null }

    if (!session || new Date(session.expires_at) < new Date()) {
      reply.clearCookie(REFRESH_COOKIE, { path: '/' })
      throw new UnauthorizedError('Invalid or expired refresh token')
    }


    const { users: user } = session
    const newRefreshToken = randomBytes(64).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    await supabase
      .from('sessions')
      .update({ token: newRefreshToken, expires_at: expiresAt })
      .eq('id', session.id)

    const accessToken = signAccessToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })

    reply.setCookie(REFRESH_COOKIE, newRefreshToken, COOKIE_OPTIONS)
    return reply.send({ data: { accessToken }, meta: meta() })
  })

  // POST /auth/logout
  fastify.post('/auth/logout', async (request, reply) => {
    const token = request.cookies[REFRESH_COOKIE]
    if (token) {
      await supabase.from('sessions').delete().eq('token', token)
    }
    reply.clearCookie(REFRESH_COOKIE, { path: '/' })

    return reply.send({ data: { success: true }, meta: meta() })
  })

  // GET /auth/me
  fastify.get('/auth/me', { preHandler: authenticate }, async (request, reply) => {
    const { data: user } = await supabase
      .from('users')
      .select('id, email, name, role')
      .eq('id', request.user!.id)
      .single() as { data: Pick<UserRow, 'id' | 'email' | 'name' | 'role'> | null }

    if (!user) throw new UnauthorizedError()
    return reply.send({ data: user, meta: meta() })
  })
}

export default authRoutes
