import { describe, it, after } from 'node:test'
import assert from 'node:assert'
import fastify from '../../index.js'

describe('POST /api/v1/websites', async () => {
    after(async () => {
        await fastify.close()
    })

    it('should return 201 when the payload is valid', async () => {
        const res = await fastify.inject({
            method: 'POST',
            url: '/api/v1/websites',
            payload: {
                title: 'Some title',
                meta_description:
                    'This is the description field for the website'
            }
        })

        assert.deepStrictEqual(res.statusCode, 201)
        assert.deepStrictEqual(JSON.parse(res.body).message, 'created')
    })
})

describe('GET /api/v1/websites', async () => {
    after(async () => {
        await fastify.close()
    })

    it('should return 200 when an empty array or an array of websites is returned', async () => {
        const res = await fastify.inject({
            method: 'GET',
            url: '/api/v1/websites'
        })

        assert.deepStrictEqual(res.statusCode, 200)
    })
})

describe('GET /api/v1/websites/{id} returns status 200', async () => {
    after(async () => {
        await fastify.close()
    })

    const id = 1

    it('should return 200 when a website object is returned', async () => {
        const res = await fastify.inject({
            method: 'GET',
            url: `/api/v1/websites/${id}`
        })

        assert.deepStrictEqual(res.statusCode, 200)
    })
})

describe('PATCH /api/v1/websites/{id}', async () => {
    after(async () => {
        await fastify.close()
    })

    const id = 1

    it('should return 200 when a website object is returned', async () => {
        const res = await fastify.inject({
            method: 'PATCH',
            url: `/api/v1/websites/${id}`
        })

        assert.deepStrictEqual(res.statusCode, 200)
    })
})

describe('DELETE /api/v1/websites/{id}', async () => {
    after(async () => {
        await fastify.close()
    })

    const id = 1

    it('should return 200 when a website object is returned', async () => {
        const res = await fastify.inject({
            method: 'DELETE',
            url: `/api/v1/websites/${id}`
        })

        assert.deepStrictEqual(res.statusCode, 200)
    })
})
