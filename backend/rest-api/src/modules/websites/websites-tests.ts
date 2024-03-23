import { describe, it, after, before } from 'node:test'
import assert from 'node:assert'
import buildApp from '../../index.js'
import { FastifyInstance } from 'fastify'

describe('websites', async () => {
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
    })

    after(() => {
        app.close()
    })

    describe('POST /api/v1/websites', () => {
        it('should return 201 when the payload is valid', async () => {
            const res = await app.inject({
                method: 'POST',
                url: '/api/v1/websites',
                headers: {
                    origin: 'http://localhost:3000',
                    host: 'localhost:3000'
                },
                payload: {
                    title: 'Some title',
                    metaDescription:
                        'This is the description field for the website'
                }
            })

            assert.deepStrictEqual(res.statusCode, 201)
            const responsePayload = JSON.parse(res.payload)
            id = responsePayload.id
        })
    })

    describe('GET /api/v1/websites', () => {
        it('should return 200 when an empty array or an array of websites is returned', async () => {
            const res = await app.inject({
                method: 'GET',
                url: '/api/v1/websites',
                headers: {
                    origin: 'http://localhost:3000',
                    host: 'localhost:3000'
                }
            })

            assert.deepStrictEqual(res.statusCode, 200)
        })
    })

    describe('GET /api/v1/websites/{id} returns status 200', () => {
        it('should return 200 when a website object is returned', async () => {
            const res = await app.inject({
                method: 'GET',
                url: `/api/v1/websites/${id}`,
                headers: {
                    origin: 'http://localhost:3000',
                    host: 'localhost:3000'
                }
            })

            assert.deepStrictEqual(res.statusCode, 200)
        })
    })

    describe('PATCH /api/v1/websites/{id}', () => {
        it('should return 200 when a website object is returned', async () => {
            const res = await app.inject({
                method: 'PATCH',
                url: `/api/v1/websites/${id}`,
                headers: {
                    origin: 'http://localhost:3000',
                    host: 'localhost:3000'
                },
                payload: {
                    title: 'New title',
                    metaDescription: 'Updated meta description'
                }
            })

            assert.deepStrictEqual(res.statusCode, 200)
        })
    })

    describe('DELETE /api/v1/websites/{id}', () => {
        it('should return 200 when a website object is returned', async () => {
            const res = await app.inject({
                method: 'DELETE',
                url: `/api/v1/websites/${id}`,
                headers: {
                    origin: 'http://localhost:3000',
                    host: 'localhost:3000'
                }
            })

            assert.deepStrictEqual(res.statusCode, 200)
        })
    })
})
