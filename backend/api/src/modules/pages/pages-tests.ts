import { FastifyInstance } from 'fastify'
import assert from 'node:assert'
import { after, before, describe, it } from 'node:test'
import { app as buildApp } from '../../index.js'

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

        const page = await app.kysely.db
            .insertInto('structure.page')
            .values({
                website_id: websiteId,
                route: `/initial`,
                title: 'Some page title',
                meta_description: 'Some page description'
            })
            .returningAll()
            .executeTakeFirstOrThrow()

        pageId = page.id
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
        })
    })

    describe('GET /api/v1/websites/{id}/pages', () => {
        it('should return 200 when an empty array or an array of pages is returned', async () => {
            const res = await app.inject({
                method: 'GET',
                url: `/api/v1/websites/${websiteId}/pages`,
                headers: {
                    origin: 'http://localhost:3000',
                    host: 'localhost:3000'
                }
            })

            assert.deepStrictEqual(res.statusCode, 200)
        })
    })

    describe('GET /api/v1/websites/{websiteId}/pages/{pageId}', () => {
        it('should return 200 when a page object is returned', async () => {
            const res = await app.inject({
                method: 'GET',
                url: `/api/v1/websites/${websiteId}/pages/${pageId}`,
                headers: {
                    origin: 'http://localhost:3000',
                    host: 'localhost:3000'
                }
            })

            assert.deepStrictEqual(res.statusCode, 200)
        })
    })

    describe('PATCH /api/v1/websites/{websiteId}/pages/{pageId}', () => {
        it('should return 200 when a page object is returned', async () => {
            const res = await app.inject({
                method: 'PATCH',
                url: `/api/v1/websites/${websiteId}/pages/${pageId}`,
                headers: {
                    origin: 'http://localhost:3000',
                    host: 'localhost:3000'
                },
                payload: {
                    route: 'newroute',
                    title: 'Updated page',
                    metaDescription: 'This is the updated description'
                }
            })

            assert.deepStrictEqual(res.statusCode, 200)
        })
    })

    describe('DELETE /api/v1/websites/{websiteId}/pages/{pageId}', () => {
        it('should return 200 when a page object is returned', async () => {
            const res = await app.inject({
                method: 'DELETE',
                url: `/api/v1/websites/${websiteId}/pages/${pageId}`,
                headers: {
                    origin: 'http://localhost:3000',
                    host: 'localhost:3000'
                }
            })

            assert.deepStrictEqual(res.statusCode, 200)
        })
    })
})
