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

    fastify.decorate('lucia', {
        luciaInstance: lucia,
        oAuth: {
            github,
            google
        }
    })
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
