import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'

async function swagger(fastify: FastifyInstance) {
    fastify.register(fastifySwagger, {
        openapi: {
            info: {
                title: 'Archtika API',
                version: '1'
            }
        }
    })

    fastify.register(fastifySwaggerUi, {
        routePrefix: '/docs'
    })
}

export default fastifyPlugin(swagger)
