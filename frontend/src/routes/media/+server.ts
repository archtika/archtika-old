import { json, type RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async ({ url, fetch }) => {
    const assetId = url.searchParams.get('id')

    const mediaData = await fetch(
        `http://localhost:3000/api/v1/media/${assetId}`
    )
    const media = await mediaData.json()

    return json(media)
}
