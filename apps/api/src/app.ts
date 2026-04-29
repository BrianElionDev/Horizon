import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import cookie from '@fastify/cookie'

import errorHandlerPlugin from './plugins/error-handler'
import healthRoutes from './routes/health/index'
import authRoutes from './routes/auth/index'
import ideasRoutes from './routes/ideas/index'

export function buildApp() {
  const fastify = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
      transport:
        process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
  })

  // Security
  fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", process.env.FRONTEND_URL ?? ''],
      },
    },
    crossOriginEmbedderPolicy: false,
  })

  fastify.register(cors, {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    keyGenerator: (req) => req.ip,
  })

  fastify.register(cookie)

  // Plugins
  fastify.register(errorHandlerPlugin)

  // Routes
  fastify.register(healthRoutes, { prefix: '/api/v1' })
  fastify.register(authRoutes, { prefix: '/api/v1' })
  fastify.register(ideasRoutes, { prefix: '/api/v1' })

  return fastify
}
