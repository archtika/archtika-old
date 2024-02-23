import { FastifyInstance } from 'fastify'
import { fastifyPlugin } from 'fastify-plugin'
import { lucia } from '../utils/lucia.js'

async function auth (fastify: FastifyInstance) {
  fastify.addHook('preHandler', async (req, reply) => {
    const sessionId = lucia.readSessionCookie(req.headers.cookie ?? '')

    if (!sessionId) {
      req.user = null
      req.session = null
      return
    }

    const { session, user } = await lucia.validateSession(sessionId)
    if (session && session.fresh) {
      const cookie = lucia.createSessionCookie(session.id)
      reply.setCookie(cookie.name, cookie.value, cookie.attributes)
    }

    if (!session) {
      const cookie = lucia.createBlankSessionCookie()
      reply.setCookie(cookie.name, cookie.value, cookie.attributes)
    }

    req.user = user
    req.session = session
    return
  })
}

export default fastifyPlugin(auth)