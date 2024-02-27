import { Lucia } from 'lucia'
import { NodePostgresAdapter } from '@lucia-auth/adapter-postgresql'
import pg from 'pg'
import { type User, type Session } from 'lucia'
import type { GitHub, Google } from 'arctic'

const pool = new pg.Pool({
    connectionString: 'postgres://postgres@localhost:15432/archtika',
})

const adapter = new NodePostgresAdapter(pool, {
    user: 'auth_user',
    session: 'user_session',
})

export const lucia = new Lucia(adapter, {
    sessionCookie: {
        attributes: {
            secure: process.env.NODE_ENV === 'production',
        },
    },
    getUserAttributes: (attributes) => {
        return {
            username: attributes.username,
            email: attributes.email,
            email_verified: attributes.email_verified,
            setupTwoFactor: attributes.two_factor_secret !== null,
            githubId: attributes.github_id,
        }
    },
})

declare module 'lucia' {
    interface Register {
        Lucia: typeof lucia
        DatabaseUserAttributes: {
            username: string
            email: string
            email_verified: boolean
            two_factor_secret: string | null
            github_id: number
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
        }
        emailVerification: {
            generateEmailVerificationCode: (
                userId: string,
                email: string
            ) => Promise<string>
            verifyVerificationCode: (
                user: User,
                code: string
            ) => Promise<boolean>
        }
        passwordReset: {
            createPasswordResetToken: (userId: string) => Promise<string>
        }
        oAuth: {
            github: GitHub
            google: Google
        }
    }
    interface FastifyRequest {
        user: User | null
        session: Session | null
    }
}
