import { Lucia, TimeSpan } from 'lucia'
import { NodePostgresAdapter } from '@lucia-auth/adapter-postgresql'
import pg from 'pg'

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