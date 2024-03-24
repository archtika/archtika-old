import { describe, it, after, before } from 'node:test'
import assert from 'node:assert'
import { app as buildApp } from '../../index.js'
import { FastifyInstance } from 'fastify'

describe('collaborators', async () => {
    let app: FastifyInstance
    let websiteId: string
    let userId: string

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

        const collaborator = await app.kysely.db
            .insertInto('auth.auth_user')
            .values({
                id: 'clijlrpji1vlwqzof7zd',
                username: 'collabuser',
                email: 'collabuser@example.com'
            })
            .onConflict((oc) =>
                oc.column('id').doUpdateSet(({ ref }) => ({
                    id: ref('excluded.id')
                }))
            )
            .returningAll()
            .executeTakeFirstOrThrow()

        userId = collaborator.id

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

        websiteId = website.id
    })

    after(() => {
        app.close()
    })

    describe('POST /api/v1/websites/{websiteId}/collaborators/{userId}', () => {
        it('should return 201 when the payload is valid', async () => {
            const res = await app.inject({
                method: 'POST',
                url: `/api/v1/websites/${websiteId}/collaborators/${userId}`,
                headers: {
                    origin: 'http://localhost:3000',
                    host: 'localhost:3000'
                },
                payload: {
                    permissionLevel: 10
                }
            })

            assert.deepStrictEqual(res.statusCode, 201)
        })
    })

    describe('GET /api/v1/websites/{websiteId}/collaborators', () => {
        it('should return 200 when a website object is returned', async () => {
            const res = await app.inject({
                method: 'GET',
                url: `/api/v1/websites/${websiteId}/collaborators`,
                headers: {
                    origin: 'http://localhost:3000',
                    host: 'localhost:3000'
                }
            })

            assert.deepStrictEqual(res.statusCode, 200)
        })
    })

    describe('PATCH /api/v1/websites/{websiteId}/collaborators/{userId}', () => {
        it('should return 200 when a website object is returned', async () => {
            const res = await app.inject({
                method: 'PATCH',
                url: `/api/v1/websites/${websiteId}/collaborators/${userId}`,
                headers: {
                    origin: 'http://localhost:3000',
                    host: 'localhost:3000'
                },
                payload: {
                    permissionLevel: 20
                }
            })

            assert.deepStrictEqual(res.statusCode, 200)
        })
    })

    describe('DELETE /api/v1/websites/{websiteId}/collaborators/{userId}', () => {
        it('should return 200 when a website object is returned', async () => {
            const res = await app.inject({
                method: 'DELETE',
                url: `/api/v1/websites/${websiteId}/collaborators/${userId}`,
                headers: {
                    origin: 'http://localhost:3000',
                    host: 'localhost:3000'
                }
            })

            assert.deepStrictEqual(res.statusCode, 200)
        })
    })
})
