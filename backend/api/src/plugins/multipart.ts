import fastifyMultipart from '@fastify/multipart'
import { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'

async function multipart(fastify: FastifyInstance) {
    fastify.register(fastifyMultipart, {
        attachFieldsToBody: true
    })
}

export default fastifyPlugin(multipart)
