import fastifyCookie from '@fastify/cookie'
import { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'

async function cookie(fastify: FastifyInstance) {
    fastify.register(fastifyCookie)
}

export default fastifyPlugin(cookie)
