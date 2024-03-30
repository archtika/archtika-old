import fastifySensible from '@fastify/sensible'
import { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'

async function cookie(fastify: FastifyInstance) {
    fastify.register(fastifySensible)
}

export default fastifyPlugin(cookie)
