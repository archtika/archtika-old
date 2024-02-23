import { FastifyRequest, FastifyReply } from "fastify"
import { lucia } from "../plugins/lucia.js"

export async function getSession(req: FastifyRequest, reply: FastifyReply) {
  const cookie = req.cookies['auth_session']
  if (!cookie) {
    return reply.unauthorized()
  }
  const session = await lucia.validateSession(cookie)
  if (!session) {
    return reply.unauthorized()
  }
  return session
}