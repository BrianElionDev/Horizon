import type { AuthUser } from '@horizon/shared'
import 'fastify'

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser
  }
}
