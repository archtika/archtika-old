import { createHash, randomUUID } from 'crypto'
import { FastifyReply, FastifyRequest } from 'fastify'
import fs from 'fs'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import {
    DeleteMediaParamsSchemaType,
    multipartFileType
} from './media-schemas.js'

const __filename = fileURLToPath(import.meta.resolve('../../'))
const __dirname = dirname(__filename)

export async function createMedia(
    req: FastifyRequest<{
        Body: { file: multipartFileType }
    }>,
    reply: FastifyReply
) {
    const data = req.body.file
    const bufferData = await data.toBuffer()

    const randomId = randomUUID()

    let media

    try {
        media = await req.server.kysely.db
            .insertInto('media.media_asset')
            .values({
                id: randomId,
                user_id: req.user?.id ?? '',
                name: path.parse(data.filename).name,
                mimetype: data.mimetype,
                file_hash: createHash('sha256').update(bufferData).digest('hex')
            })
            .onConflict((oc) => oc.constraint('uniqueFileHash').doNothing())
            .returningAll()
            .executeTakeFirstOrThrow()
    } catch (error) {
        return reply.conflict('File already exists')
    }

    const uploadsDir = path.join(__dirname, 'uploads')

    const userDir = path.join(uploadsDir, req.user?.id ?? '')
    fs.mkdirSync(userDir, { recursive: true })

    const uniqueFilename = `${randomId}${path.extname(data.filename)}`
    const filePath = path.join(userDir, uniqueFilename)

    fs.writeFileSync(filePath, bufferData)

    return reply.status(201).send(media)
}

export async function deleteMedia(
    req: FastifyRequest<{ Params: DeleteMediaParamsSchemaType }>,
    reply: FastifyReply
) {
    let media

    const { id } = req.params

    try {
        media = await req.server.kysely.db
            .deleteFrom('media.media_asset')
            .where(({ and }) => and({ id, user_id: req.user?.id }))
            .returningAll()
            .executeTakeFirstOrThrow()
    } catch (error) {
        return reply.notFound('Media not found or not allowed')
    }

    const uploadsDir = path.join(__dirname, 'uploads')
    const userDir = path.join(uploadsDir, req.user?.id ?? '')

    const file = fs
        .readdirSync(userDir)
        .find((f) => f.startsWith(req.params.id))

    fs.unlinkSync(`${uploadsDir}/${req.user?.id}/${file}`)

    return reply.status(200).send(media)
}
