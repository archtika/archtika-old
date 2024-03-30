import fastifyRedis from '@fastify/redis'
import { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'

async function redis(fastify: FastifyInstance) {
    fastify.register(fastifyRedis, {
        host: 'localhost',
        password: 'dev',
        port: 16379,
        namespace: 'sub'
    })
    fastify.register(fastifyRedis, {
        host: 'localhost',
        password: 'dev',
        port: 16379,
        namespace: 'pub'
    })
}

export default fastifyPlugin(redis)
