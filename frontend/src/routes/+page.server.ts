import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async ({ fetch }) => {
    const websitesData = await fetch('http://localhost:3000/api/v1/websites')
    const websites = await websitesData.json()

    const sharedWebsitesData = await fetch(
        'http://localhost:3000/api/v1/websites/?shared=true'
    )
    const sharedWebsites = await sharedWebsitesData.json()

    return {
        websites,
        sharedWebsites
    }
}

export const actions: Actions = {
    createWebsite: async ({ request, fetch }) => {
        const data = await request.formData()

        await fetch('http://localhost:3000/api/v1/websites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: data.get('title'),
                metaDescription: data.get('description')
            })
        })
    }
}
