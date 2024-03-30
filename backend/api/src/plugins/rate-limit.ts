import fastifyRateLimit from '@fastify/rate-limit'
import { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'

async function rateLimit(fastify: FastifyInstance) {
    await fastify.register(fastifyRateLimit, {
        max: 100,
        timeWindow: 5 * 60 * 1000,
        keyGenerator: (req) => {
            return req.user ? req.user.id || req.ip : req.ip
        }
    })

    fastify.setNotFoundHandler(
        {
            preHandler: fastify.rateLimit()
        },
        (request, reply) => {
            reply.notFound()
        }
    )
}

export default fastifyPlugin(rateLimit)
