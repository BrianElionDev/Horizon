import fp from 'fastify-plugin'
import type { FastifyPluginAsync } from 'fastify'
import { AppError } from '../lib/errors'

const errorHandlerPlugin: FastifyPluginAsync = fp(async (fastify) => {
  fastify.setErrorHandler((error, _request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        error: {
          code: error.code,
          message: error.message,
          statusCode: error.statusCode,
        },
      })
    }

    // Fastify validation errors
    if (error && typeof error === 'object' && 'validation' in error) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: (error as unknown as Error).message,
          statusCode: 400,
        },
      })
    }

    fastify.log.error(error)
    return reply.status(500).send({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
        statusCode: 500,
      },
    })
  })
})

export default errorHandlerPlugin
