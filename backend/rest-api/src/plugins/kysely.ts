import fastifyPlugin from 'fastify-plugin'
import { DB } from 'kysely-codegen'
import { Kysely, PostgresDialect } from 'kysely'
import { FastifyInstance } from 'fastify'

async function kyselyQueryBuilder(fastify: FastifyInstance) {
    const kyselyDB = new Kysely<DB>({
        dialect: new PostgresDialect({
            pool: fastify.pg.pool
        })
    })

    fastify.decorate('kysely', {
        db: kyselyDB
    })
}

export default fastifyPlugin(kyselyQueryBuilder, {
    name: 'kysely',
    dependencies: ['postgres']
})
