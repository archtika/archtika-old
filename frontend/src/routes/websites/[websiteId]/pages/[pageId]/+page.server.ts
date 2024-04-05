import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ fetch, params, parent }) => {
    const pageData = await fetch(
        `http://localhost:3000/api/v1/websites/${params.websiteId}/pages/${params.pageId}`
    )
    const pagesData = await fetch(
        `http://localhost:3000/api/v1/websites/${params.websiteId}/pages`
    )
    const componentsData = await fetch(
        `http://localhost:3000/api/v1/pages/${params.pageId}/components`
    )
    const mediaData = await fetch(`http://localhost:3000/api/v1/media`)

    const { website } = await parent()
    const page = await pageData.json()
    const pages = await pagesData.json()
    const components = await componentsData.json()
    const media = await mediaData.json()

    return {
        website,
        page,
        pages,
        components,
        media
    }
}

export const actions: Actions = {
    createComponent: async ({ request, fetch, params }) => {
        const data = request.formData()

        /* await fetch(
            `http://localhost:3000/api/v1/pages/${params.pageId}/components`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({

                })
            }
        ) */
    }
}
