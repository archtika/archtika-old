import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ fetch, params }) => {
    const websiteData = await fetch(
        `http://localhost:3000/api/v1/websites/${params.websiteId}`
    )
    const pagesData = await fetch(
        `http://localhost:3000/api/v1/websites/${params.websiteId}/pages`
    )

    const website = await websiteData.json()
    const pages = await pagesData.json()

    return {
        website,
        pages
    }
}
