import fastifyPlugin from 'fastify-plugin'
import fastifyMultipart from '@fastify/multipart'
import { FastifyInstance } from 'fastify'

async function multipart(fastify: FastifyInstance) {
    fastify.register(fastifyMultipart, {
        attachFieldsToBody: true
    })
}

export default fastifyPlugin(multipart)
