import { Lucia } from 'lucia'
import { NodePostgresAdapter } from '@lucia-auth/adapter-postgresql'
import pg from 'pg'
import { type User, type Session } from 'lucia'

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
      email: attributes.email
    }
  }
})

interface DatabaseUser {
  id: string
  username: string
  email: string
  password: string
}

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia
    DatabaseUserAttributes: {
      username: string
      email: string
      email_verified: boolean
    }
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    user: User | null
    session: Session | null
  }
}