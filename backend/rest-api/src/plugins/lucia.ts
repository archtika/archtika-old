import { Lucia } from 'lucia'
import { NodePostgresAdapter } from '@lucia-auth/adapter-postgresql'
import pg from 'pg'
import { type User, type Session } from 'lucia'
import { GitHub, Google } from 'arctic'
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import { verifyRequestOrigin } from 'lucia'
import { Kysely } from 'kysely'
import { DB } from 'kysely-codegen'

let lucia: Lucia

async function luciaAuth(fastify: FastifyInstance) {
    const pool = new pg.Pool({
        connectionString: fastify.config.DATABASE_URL
    })

    const adapter = new NodePostgresAdapter(pool, {
        user: 'auth.auth_user',
        session: 'auth.user_session'
    })

    lucia = new Lucia(adapter, {
        sessionCookie: {
            attributes: {
                secure: process.env.NODE_ENV === 'production'
            }
        },
        getUserAttributes: (attributes) => {
            return {
                username: attributes.username,
                email: attributes.email
            }
        }
    })

    const github = new GitHub(
        fastify.config.DEV_GITHUB_CLIENT_ID,
        fastify.config.DEV_GITHUB_CLIENT_SECRET
    )
    const google = new Google(
        fastify.config.DEV_GOOGLE_CLIENT_ID,
        fastify.config.DEV_GOOGLE_CLIENT_SECRET,
        'http://localhost:3000/api/v1/account/login/google/callback'
    )

    async function getSession(req: FastifyRequest, reply: FastifyReply) {
        const cookie = req.cookies['auth_session']
        if (!cookie) {
            return reply.unauthorized()
        }
        const session = await lucia.validateSession(cookie)
        if (!session) {
            return reply.unauthorized()
        }
        return session as unknown as Session
    }

    fastify.decorate('lucia', {
        luciaInstance: lucia,
        oAuth: {
            github,
            google
        },
        getSession
    })

    fastify.addHook('preHandler', async (req, reply) => {
        const sessionId =
            req.cookies[fastify.lucia.luciaInstance.sessionCookieName]

        if (!sessionId) {
            req.user = null
            req.session = null
            return
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
            const cookie =
                fastify.lucia.luciaInstance.createBlankSessionCookie()
            reply.setCookie(cookie.name, cookie.value, cookie.attributes)
        }

        req.user = user
        req.session = session
        return
    })

    /* fastify.addHook('preHandler', (req, res, done) => {
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
    }) */
}

declare module 'lucia' {
    interface Register {
        Lucia: typeof lucia
        DatabaseUserAttributes: {
            username: string
            email: string
        }
    }
}

declare module 'fastify' {
    interface FastifyInstance {
        config: {
            DEV_GITHUB_CLIENT_ID: string
            DEV_GITHUB_CLIENT_SECRET: string
            DEV_GOOGLE_CLIENT_ID: string
            DEV_GOOGLE_CLIENT_SECRET: string
            DATABASE_URL: string
        }
        lucia: {
            luciaInstance: Lucia
            oAuth: {
                github: GitHub
                google: Google
            }
            getSession: (
                req: FastifyRequest,
                reply: FastifyReply
            ) => Promise<Session>
        }
        kysely: {
            db: Kysely<DB>
        }
    }
    interface FastifyRequest {
        user: User | null
        session: Session | null
    }
}

export default fastifyPlugin(luciaAuth)
