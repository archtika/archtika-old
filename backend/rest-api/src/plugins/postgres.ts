import fastifyPlugin from 'fastify-plugin'
import fastifyPostgres from '@fastify/postgres'
import { FastifyInstance } from 'fastify'

async function dbConnector(fastify: FastifyInstance) {
    fastify.register(fastifyPostgres, {
        connectionString: 'postgres://postgres@localhost:15432/archtika',
    })
}

export default fastifyPlugin(dbConnector)
