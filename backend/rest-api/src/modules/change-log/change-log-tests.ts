import { FastifyInstance } from 'fastify'
import assert from 'node:assert'
import { after, before, describe, it } from 'node:test'
import { app as buildApp } from '../../index.js'

describe('change-log', async () => {
    let app: FastifyInstance
    let id: string

    before(async () => {
        app = buildApp()
        await app.ready()

        await app.kysely.db
            .insertInto('auth.auth_user')
            .values({
                id: 'qkj7ld6pgsqvurgfxaao',
                username: 'testuser',
                email: 'testuser@example.com'
            })
            .onConflict((oc) => oc.column('id').doNothing())
            .execute()

        const website = await app.kysely.db
            .insertInto('structure.website')
            .values({
                user_id: 'qkj7ld6pgsqvurgfxaao',
                title: 'Some title',
                meta_description: 'Some description',
                last_modified_by: 'qkj7ld6pgsqvurgfxaao'
            })
            .returningAll()
            .executeTakeFirstOrThrow()

        id = website.id
    })

    after(() => {
        app.close()
    })

    describe('GET /api/v1/websites/{id}/change-log', () => {
        it('should return 200 when a change-log array of objects is returned', async () => {
            const res = await app.inject({
                method: 'GET',
                url: `/api/v1/websites/${id}/change-log`,
                headers: {
                    origin: 'http://localhost:3000',
                    host: 'localhost:3000'
                }
            })

            assert.deepStrictEqual(res.statusCode, 200)
        })
    })
})
