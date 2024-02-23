import { lucia } from "./lucia.js"
import { type User, type Session } from 'lucia'

interface DatabaseUser {
  id: string
  username: string
  email: string
  password: string
}

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia
    DatabaseUserAttributes: Omit<DatabaseUser, 'id'>
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    user: User | null
    session: Session | null
  }
}