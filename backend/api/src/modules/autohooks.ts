import { FastifyInstance } from 'fastify'
import { verifyRequestOrigin } from 'lucia'

export default async function (fastify: FastifyInstance) {
    fastify.addHook('preHandler', async (req, reply) => {
        const originHeader = req.headers.origin ?? null
        const hostHeader = req.headers.host ?? null

        if (
            req.method !== 'GET' &&
            (!originHeader ||
                !hostHeader ||
                !verifyRequestOrigin(originHeader, [hostHeader]))
        ) {
            return reply.notAcceptable()
        }
    })

    fastify.addHook('preHandler', async (req, reply) => {
        const sessionId =
            req.cookies[fastify.lucia.luciaInstance.sessionCookieName]

        if (sessionId) {
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
        } else {
            req.user =
                process.env.NODE_ENV === 'test'
                    ? { id: 'qkj7ld6pgsqvurgfxaao' }
                    : null
            req.session = null
        }
    })

    fastify.addHook('preHandler', async (req, reply) => {
        if (
            !req.user &&
            !req.session &&
            !req.url.includes('/account/login') &&
            process.env.NODE_ENV !== 'test'
        ) {
            return reply.unauthorized()
        }
    })
}
