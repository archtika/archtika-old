import fastifyPlugin from 'fastify-plugin'
import fastifyHelmet from '@fastify/helmet'
import { FastifyInstance } from 'fastify'

async function helmet(fastify: FastifyInstance) {
    fastify.register(fastifyHelmet)
}

export default fastifyPlugin(helmet)
