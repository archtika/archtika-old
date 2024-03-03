import fastifyPlugin from 'fastify-plugin'
import fastifyPostgres from '@fastify/postgres'
import { FastifyInstance } from 'fastify'

async function dbConnector(fastify: FastifyInstance) {
    fastify.register(fastifyPostgres, {
        connectionString: fastify.config.DATABASE_URL
    })
}

export default fastifyPlugin(dbConnector, {
    name: 'postgres'
})
