import { FastifyRequest, FastifyReply } from 'fastify'
import fs from 'fs'
import path, { dirname } from 'path'
import { randomUUID, createHash } from 'crypto'
import { fileURLToPath } from 'url'
import { DeleteMediaParamsSchemaType, multipartFileType } from './schemas.js'

const __filename = fileURLToPath(import.meta.resolve('../../'))
const __dirname = dirname(__filename)

export async function createMedia(
    req: FastifyRequest<{
        Body: { file: multipartFileType }
    }>,
    reply: FastifyReply
) {
    if (!req.user) {
        return reply.unauthorized()
    }

    const data = req.body.file
    const bufferData = await data.toBuffer()

    const existingMedia = await req.server.kysely.db
        .selectFrom('media.media_asset')
        .where((eb) =>
            eb.and({
                user_id: req.user?.id,
                file_hash: createHash('sha256').update(bufferData).digest('hex')
            })
        )
        .executeTakeFirst()

    if (existingMedia) {
        return reply.conflict('Media already exists')
    }

    const uploadsDir = path.join(__dirname, 'uploads')

    const userDir = path.join(uploadsDir, req.user.id)
    fs.mkdirSync(userDir, { recursive: true })

    const randomId = randomUUID()

    const uniqueFilename = `${randomId}${path.extname(data.filename)}`
    const filePath = path.join(userDir, uniqueFilename)

    fs.writeFileSync(filePath, bufferData)

    await req.server.kysely.db
        .insertInto('media.media_asset')
        .values({
            id: randomId,
            user_id: req.user.id,
            name: path.parse(data.filename).name,
            mimetype: data.mimetype,
            file_hash: createHash('sha256').update(bufferData).digest('hex')
        })
        .execute()

    return reply.status(201).send({ message: 'Media created' })
}

export async function deleteMedia(
    req: FastifyRequest<{ Params: DeleteMediaParamsSchemaType }>,
    reply: FastifyReply
) {
    if (!req.user) {
        return reply.unauthorized()
    }

    await req.server.kysely.db
        .deleteFrom('media.media_asset')
        .where((eb) => eb.and({ id: req.params.id, user_id: req.user?.id }))
        .execute()

    const uploadsDir = path.join(__dirname, 'uploads')
    const userDir = path.join(uploadsDir, req.user.id)

    const file = fs
        .readdirSync(userDir)
        .find((f) => f.startsWith(req.params.id))

    fs.unlinkSync(`${uploadsDir}/${req.user.id}/${file}`)

    return reply.status(204).send({ message: 'Media deleted' })
}
