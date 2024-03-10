import { FastifyRequest, FastifyReply } from 'fastify'
import util from 'util'
import { pipeline } from 'stream'
import fs from 'fs'
import path, { dirname } from 'path'
import { randomUUID, createHash } from 'crypto'
import { fileURLToPath } from 'url'

const pump = util.promisify(pipeline)
const __filename = fileURLToPath(import.meta.resolve('../../'))
const __dirname = dirname(__filename)

export async function createMedia(req: FastifyRequest, reply: FastifyReply) {
    await req.server.lucia.getSession(req, reply)

    if (!req.user) {
        return reply.status(401).send({ message: 'Unauthorized' })
    }

    const { file } = req.body

    const uploadsDir = path.join(__dirname, 'uploads')

    const userDir = path.join(uploadsDir, req.user.id)
    fs.mkdirSync(userDir, { recursive: true })

    const uniqueFilename = `${randomUUID()}${path.extname(file.filename)}`
    const filePath = path.join(userDir, uniqueFilename)

    await pump(file.file, fs.createWriteStream(filePath))

    await req.server.kysely.db
        .insertInto('media.media_asset')
        .values({
            user_id: req.user.id,
            name: file.filename,
            path: filePath,
            file_hash: createHash('sha256').update(file._buf).digest('hex')
        })
        .execute()

    return reply.status(201).send({ message: 'Media created' })
}
