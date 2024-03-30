import { FastifyInstance } from 'fastify'
import { readFile } from 'fs/promises'
import assert from 'node:assert'
import { after, before, describe, it } from 'node:test'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { app as buildApp } from '../../index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

describe('media', async () => {
    let app: FastifyInstance
    let id: string

    before(async () => {
        app = buildApp()
    })

    after(() => {
        app.close()
    })

    // Does not work yet, needs to be tested further
    describe('POST /api/v1/media', { skip: true, todo: true }, () => {
        it('should return 201 when the payload is valid', async () => {
            const fileName = 'test-image.jpg'
            const filePath = resolve(
                __dirname,
                '../../../src/utils/testing/test-image.jpg'
            )
            const rawFileData = await readFile(filePath)
            const blob = new Blob([rawFileData])
            const form = new FormData()
            form.append('file', blob, fileName)

            const res = await app.inject({
                method: 'POST',
                url: '/api/v1/media',
                headers: {
                    origin: 'http://localhost:3000',
                    host: 'localhost:3000'
                },
                payload: form
            })

            assert.deepStrictEqual(res.statusCode, 201)
        })
    })

    /* describe('DELETE /api/v1/media', () => {
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
    }) */
})
