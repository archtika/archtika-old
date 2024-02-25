import { Lucia } from 'lucia'
import { NodePostgresAdapter } from '@lucia-auth/adapter-postgresql'
import pg from 'pg'
import { type User, type Session } from 'lucia'
import { GitHub } from 'arctic'
import { fastify } from '../index.js'

const pool = new pg.Pool({
  connectionString: 'postgres://postgres@localhost:15432/archtika'
})

const adapter = new NodePostgresAdapter(pool, {
  user: 'auth_user',
  session: 'user_session'
})

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === 'production'
    }
  },
  getUserAttributes: (attributes) => {
    return {
      username: attributes.username,
      email: attributes.email,
      setupTwoFactor: attributes.two_factor_secret !== null,
      githubId: attributes.github_id
    }
  }
})

export const github = new GitHub(fastify.config.DEV_GITHUB_CLIENT_ID, fastify.config.DEV_GITHUB_CLIENT_SECRET)

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
    }
  }
  interface FastifyRequest {
    user: User | null
    session: Session | null
  }
}