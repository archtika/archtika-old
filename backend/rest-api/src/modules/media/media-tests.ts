import { describe, it, after, before } from 'node:test'
import assert from 'node:assert'
import { app as buildApp } from '../../index.js'
import { FastifyInstance } from 'fastify'

describe('media', async () => {
    let app: FastifyInstance
    let id: string

    before(async () => {
        app = buildApp()
    })

    after(() => {
        app.close()
    })

    describe('POST /api/v1/media', () => {
        it('should return 201 when the payload is valid', async () => {
            const res = await app.inject({
                method: 'POST',
                url: '/api/v1/media',
                headers: {
                    origin: 'http://localhost:3000',
                    host: 'localhost:3000'
                }
            })

            assert.deepStrictEqual(res.statusCode, 201)
        })
    })

    describe('DELETE /api/v1/media', () => {
        it('should return 200 when an asset object is returned', async () => {
            const res = await app.inject({
                method: 'DELETE',
                url: '/api/v1/media',
                headers: {
                    origin: 'http://localhost:3000',
                    host: 'localhost:3000'
                }
            })

            assert.deepStrictEqual(res.statusCode, 200)
        })
    })
})
