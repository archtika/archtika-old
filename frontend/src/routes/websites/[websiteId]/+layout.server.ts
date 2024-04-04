import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ fetch, params }) => {
    const websiteData = await fetch(
        `http://localhost:3000/api/v1/websites/${params.websiteId}`
    )

    const website = await websiteData.json()

    return {
        website
    }
}
