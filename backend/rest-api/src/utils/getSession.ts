import { FastifyRequest, FastifyReply } from "fastify"
import { lucia } from "./lucia.js"

export async function getSession(req: FastifyRequest, reply: FastifyReply) {
  const cookie = req.cookies['auth_session']
  if (!cookie) {
    return reply.status(401).send({ message: 'Not logged in' })
  }
  const session = await lucia.validateSession(cookie)
  if (!session) {
    return reply.status(401).send({ message: 'Not logged in' }) 
  }
  return session
}