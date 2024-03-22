import { FastifyInstance } from 'fastify'
import { verifyRequestOrigin } from 'lucia'

export default async function (fastify: FastifyInstance) {
    fastify.addHook('preHandler', async (req, reply) => {
        if (req.method === 'GET') {
            return reply.send()
        }

        const originHeader = req.headers.origin ?? null
        const hostHeader = req.headers.host ?? null

        if (
            !originHeader ||
            !hostHeader ||
            !verifyRequestOrigin(originHeader, [hostHeader])
        ) {
            console.error('Invalid origin', { originHeader, hostHeader })
            return reply.notAcceptable('Invalid origin')
        }

        return reply.send()
    })

    fastify.addHook('preHandler', async (req, reply) => {
        const sessionId =
            req.cookies[fastify.lucia.luciaInstance.sessionCookieName]

        if (!sessionId) {
            req.user = null
            req.session = null
            return reply.send()
        }

        const { session, user } =
            await fastify.lucia.luciaInstance.validateSession(sessionId)

        if (session && session.fresh) {
            const cookie = fastify.lucia.luciaInstance.createSessionCookie(
                session.id
            )
            reply.setCookie(cookie.name, cookie.value, cookie.attributes)
        }

        if (!session) {
            reply.clearCookie(fastify.lucia.luciaInstance.sessionCookieName)
        }

        req.user = user
        req.session = session
        return reply.send()
    })

    fastify.addHook('preHandler', (req, reply) => {
        if (process.env.NODE_ENV === 'test') {
            return reply.send()
        }

        if (!req.user && !req.session && !req.url.includes('/account/login')) {
            return reply.unauthorized()
        }
    })
}
