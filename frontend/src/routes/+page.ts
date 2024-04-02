import type { PageLoad } from './$types'

export const load: PageLoad = async ({ fetch }) => {
    const websitesData = await fetch('http://localhost:3000/api/v1/websites')
    const websites = await websitesData.json()

    return {
        websites
    }
}
