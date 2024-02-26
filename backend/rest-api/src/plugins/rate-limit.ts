import fastifyPlugin from 'fastify-plugin'
import fastifyRateLimit from '@fastify/rate-limit'
import { FastifyInstance } from 'fastify'

async function rateLimit(fastify: FastifyInstance) {
    await fastify.register(fastifyRateLimit, {
        max: 100,
        timeWindow: 5 * 60 * 1000,
        keyGenerator: (req) => {
            return req.user ? req.user.id || req.ip : req.ip
        },
    })

    fastify.setNotFoundHandler(
        {
            preHandler: fastify.rateLimit(),
        },
        (request, reply) => {
            reply.code(404).send(null)
        }
    )
}

export default fastifyPlugin(rateLimit)
