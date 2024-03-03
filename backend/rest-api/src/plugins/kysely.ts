import fastifyPlugin from 'fastify-plugin'
import { DB } from 'kysely-codegen'
import { Kysely, PostgresDialect } from 'kysely'
import * as path from 'path'
import { promises as fs } from 'fs'
import { Migrator, FileMigrationProvider } from 'kysely'
import { FastifyInstance } from 'fastify'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
const __filename = fileURLToPath(import.meta.resolve('../db-migrations'))
const __dirname = dirname(__filename)

async function kyselyQueryBuilder(fastify: FastifyInstance) {
    const kyselyDB = new Kysely<DB>({
        dialect: new PostgresDialect({
            pool: fastify.pg.pool
        })
    })

    async function migrateToLatest() {
        const migrator = new Migrator({
            db: kyselyDB,
            provider: new FileMigrationProvider({
                fs,
                path,
                migrationFolder: path.join(__dirname, 'db-migrations')
            })
        })

        const { error, results } = await migrator.migrateToLatest()

        results?.forEach((it) => {
            if (it.status === 'Success') {
                console.log(
                    `Migration "${it.migrationName}" was executed successfully`
                )
            } else if (it.status === 'Error') {
                console.error(
                    `Failed to execute migration "${it.migrationName}"`
                )
            }
        })

        if (error) {
            console.error('failed to migrate')
            console.error(error)
            process.exit(1)
        }

        await kyselyDB.destroy()
    }

    migrateToLatest()

    fastify.decorate('kysely', {
        db: kyselyDB
    })
}

export default fastifyPlugin(kyselyQueryBuilder, {
    name: 'kysely',
    dependencies: ['postgres']
})
