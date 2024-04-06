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
        const data = await request.formData()

        let body: any

        switch (data.get('type')) {
            case 'text':
                body = {
                    type: data.get('type'),
                    content: {
                        textContent: data.get('content')
                    }
                }
                break
            case 'image':
            case 'audio':
            case 'video':
                const formData = new FormData()
                formData.append('file', data.get('file') as File)

                const existingFile = data.get('existing-file')

                console.log(data.get('existing-file'))

                let image

                if (!existingFile) {
                    const imageData = await fetch(
                        'http://localhost:3000/api/v1/media',
                        {
                            method: 'POST',
                            body: formData
                        }
                    )

                    image = await imageData.json()
                }

                body = {
                    type: data.get('type'),
                    content: {
                        altText: data.get('alt-text')
                    },
                    assetId: existingFile ? existingFile : image.id
                }

                if (['audio', 'video'].includes(data.get('type') as string)) {
                    body.content.isLooped = data.get('is-looped')
                }

                break
        }

        await fetch(
            `http://localhost:3000/api/v1/pages/${params.pageId}/components`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            }
        )
    },
    deleteComponent: async ({ request, fetch, params }) => {
        const data = await request.formData()

        await fetch(
            `http://localhost:3000/api/v1/pages/${params.pageId}/components/${data.get('id')}`,
            {
                method: 'DELETE'
            }
        )
    }
}
