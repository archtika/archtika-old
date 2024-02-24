import { Lucia } from 'lucia'
import { NodePostgresAdapter } from '@lucia-auth/adapter-postgresql'
import pg from 'pg'
import { type User, type Session } from 'lucia'
import { RequestGenericInterface } from 'fastify'

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
      setupTwoFactor: attributes.two_factor_secret !== null
    }
  }
})

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia
    DatabaseUserAttributes: {
      username: string
      email: string
      email_verified: boolean
      two_factor_secret: string | null
    }
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    user: User | null
    session: Session | null
  }
}