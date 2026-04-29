import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import cookie from '@fastify/cookie'

import errorHandlerPlugin from './plugins/error-handler'
import healthRoutes from './routes/health/index'
import authRoutes from './routes/auth/index'
import ideasRoutes from './routes/ideas/index'

function parseAllowedOrigins(): string[] {
  const raw = process.env.FRONTEND_URL ?? 'http://localhost:3000'
  return raw.split(',').map((o) => o.trim()).filter(Boolean)
}

export function buildApp() {
  const allowedOrigins = parseAllowedOrigins()
  const fastify = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
      transport:
        process.env.NODE_ENV === 'development'
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
        connectSrc: ["'self'", ...allowedOrigins],
      },
    },
    crossOriginEmbedderPolicy: false,
  })

  fastify.register(cors, {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'), false)
      }
    },
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

export default buildApp()
