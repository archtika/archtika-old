import { describe, it, after, before } from 'node:test'
import assert from 'node:assert'
import { app as buildApp } from '../../index.js'
import { FastifyInstance } from 'fastify'

describe('pages', async () => {
    let app: FastifyInstance
    let websiteId: string
    let pageId: string

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

        websiteId = website.id
    })

    after(() => {
        app.close()
    })

    describe('POST /api/v1/websites/{id}/pages', () => {
        it('should return 201 when the payload is valid', async () => {
            const res = await app.inject({
                method: 'POST',
                url: `/api/v1/websites/${websiteId}/pages`,
                headers: {
                    origin: 'http://localhost:3000',
                    host: 'localhost:3000'
                },
                payload: {
                    route: 'someroute',
                    title: 'Some page',
                    metaDescription: 'Here comes the description'
                }
            })

            assert.deepStrictEqual(res.statusCode, 201)
            const responsePayload = JSON.parse(res.payload)
            pageId = responsePayload.pageId
        })
    })
})
