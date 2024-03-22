import { describe, it, after, before } from 'node:test'
import assert from 'node:assert'
import buildApp from '../../index.js'
import { FastifyInstance } from 'fastify'

describe('websites', async () => {
    let app: FastifyInstance

    before(() => {
        app = buildApp()
    })

    after(() => {
        app.close()
    })

    const id = 1

    describe('POST /api/v1/websites', async () => {
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
                    meta_description:
                        'This is the description field for the website'
                }
            })

            assert.deepStrictEqual(res.statusCode, 201)
        })
    })

    describe('GET /api/v1/websites', async () => {
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

    describe('GET /api/v1/websites/{id} returns status 200', async () => {
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

    describe('PATCH /api/v1/websites/{id}', async () => {
        it('should return 200 when a website object is returned', async () => {
            const res = await app.inject({
                method: 'PATCH',
                url: `/api/v1/websites/${id}`,
                headers: {
                    origin: 'http://localhost:3000',
                    host: 'localhost:3000'
                }
            })

            assert.deepStrictEqual(res.statusCode, 200)
        })
    })

    describe('DELETE /api/v1/websites/{id}', async () => {
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
