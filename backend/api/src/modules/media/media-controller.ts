import { createHash, randomUUID } from 'crypto'
import { FastifyReply, FastifyRequest } from 'fastify'
import path from 'path'
import {
    CreateMediaAssociationSchemaType,
    GetAllMediaQuerySchemaType,
    ParamsSchemaType,
    multipartFileSchemaType
} from './media-schemas.js'
import { mimeTypes } from '../../utils/mimetypes.js'

export async function createMedia(
    req: FastifyRequest<{
        Body: { file: multipartFileSchemaType }
    }>,
    reply: FastifyReply
) {
    const data = req.body.file

    const isMimetypeValid = Object.values(mimeTypes).some((types) =>
        types.includes(data.mimetype)
    )

    if (!isMimetypeValid) {
        return reply.badRequest('Invalid file type')
    }

    const bufferData = await data.toBuffer()
    const buffer = Buffer.from(bufferData)

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
                file_hash: createHash('sha256').update(buffer).digest('hex')
            })
            .onConflict((oc) => oc.constraint('uniqueFileHash').doNothing())
            .returningAll()
            .executeTakeFirstOrThrow()
    } catch (error) {
        return reply.conflict('File already exists')
    }

    const bucketName = 'archtika'
    const objectName = randomId

    try {
        await req.server.minio.client.putObject(
            bucketName,
            objectName,
            buffer,
            {
                'Content-Type': media.mimetype,
                'X-Amz-Meta-Original-Name': media.name,
                'X-Amz-Meta-File-Hash': media.file_hash
            }
        )

        console.log('File uploaded successfully')
    } catch (err) {
        console.log(err)
        return reply.internalServerError('Error uploading file')
    }

    return reply.status(201).send(media)
}

export async function createMediaAssociation(
    req: FastifyRequest<{
        Body: CreateMediaAssociationSchemaType
    }>,
    reply: FastifyReply
) {
    const { assetId, pageId } = req.body

    await req.server.kysely.db
        .insertInto('media.media_page_link')
        .values(({ selectFrom }) => ({
            media_id: selectFrom('media.media_asset')
                .select('id')
                .where(({ and }) =>
                    and({ id: assetId, user_id: req.user?.id })
                ),
            page_id: selectFrom('structure.page')
                .select('id')
                .where('id', '=', pageId)
                .where(({ or, exists, ref }) =>
                    or([
                        exists(
                            selectFrom('structure.website').where(({ and }) =>
                                and({
                                    id: ref('structure.page.website_id'),
                                    user_id: req.user?.id
                                })
                            )
                        ),
                        exists(
                            selectFrom('collaboration.collaborator')
                                .where(({ and }) =>
                                    and({
                                        website_id: ref(
                                            'structure.page.website_id'
                                        ),
                                        user_id: req.user?.id
                                    })
                                )
                                .where('permission_level', '>=', 20)
                        )
                    ])
                )
        }))
        .onConflict((oc) =>
            oc.constraint('mediaPageLinkPrimaryKey').doNothing()
        )
        .returningAll()
        .executeTakeFirst()
}

export async function getAllMedia(
    req: FastifyRequest<{ Querystring: GetAllMediaQuerySchemaType }>,
    reply: FastifyReply
) {
    const pageId = req.query.pageId

    console.log(pageId)

    const media = await req.server.kysely.db
        .selectFrom('media.media_asset')
        .selectAll()
        .$if(!pageId, (qb) => qb.where('user_id', '=', req.user?.id ?? ''))
        .$if(Boolean(pageId), (qb) =>
            qb.where(({ exists, selectFrom }) =>
                exists(
                    selectFrom('media.media_page_link').where(
                        'page_id',
                        '=',
                        pageId ?? ''
                    )
                )
            )
        )
        .execute()

    const assetsWithPresignedUrls = await Promise.all(
        media.map(async (asset) => {
            const presignedUrl =
                await req.server.minio.client.presignedGetObject(
                    'archtika',
                    `${asset.id}`
                )
            return {
                ...asset,
                url: presignedUrl
            }
        })
    )

    return reply.status(200).send(assetsWithPresignedUrls)
}

export async function getMedia(
    req: FastifyRequest<{ Params: ParamsSchemaType }>,
    reply: FastifyReply
) {
    let media

    const { id } = req.params

    try {
        media = await req.server.kysely.db
            .selectFrom('media.media_asset')
            .selectAll()
            .where(({ and }) => and({ id, user_id: req.user?.id }))
            .executeTakeFirstOrThrow()
    } catch (error) {
        return reply.notFound('Media not found or not allowed')
    }

    const presignedUrl = await req.server.minio.client.presignedGetObject(
        'archtika',
        media.id
    )

    const assetWithPresignedUrl = {
        ...media,
        url: presignedUrl
    }

    return reply.status(200).send(assetWithPresignedUrl)
}

export async function deleteMedia(
    req: FastifyRequest<{ Params: ParamsSchemaType }>,
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

    try {
        await req.server.minio.client.removeObject('archtika', media.id)
    } catch (err) {
        console.error(err)
        return reply.internalServerError('Error deleting file')
    }

    return reply.status(200).send(media)
}
