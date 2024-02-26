import fastifyPlugin from 'fastify-plugin'
import fastifyCookie from '@fastify/cookie'
import { FastifyInstance } from 'fastify'

async function cookie(fastify: FastifyInstance) {
    fastify.register(fastifyCookie, {})
}

export default fastifyPlugin(cookie)
