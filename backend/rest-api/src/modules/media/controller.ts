import { FastifyRequest, FastifyReply } from 'fastify'
import util from 'node:util'
import { pipeline } from 'node:stream'
import fs from 'node:fs'
const pump = util.promisify(pipeline)

export async function createMedia(req: FastifyRequest, reply: FastifyReply) {
    await req.server.lucia.getSession(req, reply)

    if (!req.user) {
        return reply.status(401).send({ message: 'Unauthorized' })
    }

    console.log(req.body)
}
