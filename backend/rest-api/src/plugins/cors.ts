import fastifyPlugin from 'fastify-plugin'
import fastifyCors from '@fastify/cors'
import { FastifyInstance } from 'fastify'

async function cors(fastify: FastifyInstance) {
    fastify.register(fastifyCors)
}

export default fastifyPlugin(cors)
