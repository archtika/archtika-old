import fastifyPlugin from 'fastify-plugin'
import fastifySensible from '@fastify/sensible'
import { FastifyInstance } from 'fastify'

async function cookie (fastify: FastifyInstance) {
  fastify.register(fastifySensible)
}

export default fastifyPlugin(cookie)