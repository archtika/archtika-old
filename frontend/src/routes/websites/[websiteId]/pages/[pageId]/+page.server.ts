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

    const { website } = await parent()
    const page = await pageData.json()
    const pages = await pagesData.json()
    const components = await componentsData.json()

    return {
        website,
        page,
        pages,
        components
    }
}

export const actions: Actions = {}
