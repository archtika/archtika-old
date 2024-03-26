import { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import { Kysely, PostgresDialect } from 'kysely'
import { DB } from 'kysely-codegen'

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
