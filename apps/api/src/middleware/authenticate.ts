import type { FastifyRequest, FastifyReply } from 'fastify'
import { verifyAccessToken } from '../lib/jwt'
import { UnauthorizedError } from '../lib/errors'

export async function authenticate(request: FastifyRequest, _reply: FastifyReply) {
  const authHeader = request.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing authorization header')
  }

  const token = authHeader.slice(7)
  try {
    request.user = verifyAccessToken(token)
  } catch {
    throw new UnauthorizedError('Invalid or expired token')
  }
}
