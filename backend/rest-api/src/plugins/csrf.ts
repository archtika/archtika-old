import { FastifyInstance } from 'fastify'
import { fastifyPlugin } from 'fastify-plugin'
import { verifyRequestOrigin } from 'lucia'

type Options = {
    enabled: boolean
}

async function csrf(fastify: FastifyInstance, opts: Options) {
    if (!opts.enabled) {
        return
    }

    fastify.addHook('preHandler', (req, res, done) => {
        if (req.method === 'GET') {
            return done()
        }

        const originHeader = req.headers.origin ?? null
        const hostHeader = req.headers.host ?? null
        if (
            !originHeader ||
            !hostHeader ||
            !verifyRequestOrigin(originHeader, [hostHeader])
        ) {
            console.error('Invalid origin', { originHeader, hostHeader })
            return res.status(403).send('Invalid origin')
        }
    })
}

export default fastifyPlugin(csrf)
