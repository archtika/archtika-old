import { describe, it, before, after } from 'node:test'
import assert from 'node:assert'
import fastify from '../../index.js'

describe('GET /api/v1/websites returns status 200', async () => {
    after(async () => {
        await fastify.close()
    })
    const res = await fastify.inject({
        method: 'GET',
        url: '/api/v1/websites'
    })

    assert.deepStrictEqual(res.statusCode, 200)
})

describe('GET /api/v1/websites/{id} returns status 200', async () => {
    after(async () => {
        await fastify.close()
    })
    const res = await fastify.inject({
        method: 'GET',
        url: '/api/v1/websites'
    })

    assert.deepStrictEqual(res.statusCode, 200)
})
