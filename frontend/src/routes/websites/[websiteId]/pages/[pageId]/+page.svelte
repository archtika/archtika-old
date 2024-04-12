<script lang="ts">
    import type { PageServerData } from './$types'
    import RenderComponent from '$lib/components/RenderComponent.svelte'
    import { enhance } from '$app/forms'
    import type { Component, Media, FilteredMedia } from '$lib/types'
    import { page } from '$app/stores'
    import { browser } from '$app/environment'

    export let data: PageServerData

    const mimeTypes = {
        image: ['image/jpeg', 'image/png', 'image/svg+xml'],
        audio: ['audio/mpeg', 'audio/wav', 'audio/aac', 'audio/ogg'],
        video: ['video/mp4', 'video/webm', 'video/ogg']
    }

    $: filteredMedia = Object.entries(mimeTypes).reduce(
        (acc, [type, mimes]) => {
            acc[type] = data.media.filter((media: Media) =>
                mimes.includes(media.mimetype)
            )
            return acc
        },
        {} as FilteredMedia
    )

    $: componentsWithMedia = data.components.map((component: Component) => {
        if (['image', 'audio', 'video'].includes(component.type)) {
            return {
                ...component,
                media: data.pageMedia.find(
                    (media: Media) => media.id === component.asset_id
                )
            }
        }

        return component
    })

    let ws: WebSocket

    if (browser) {
        ws = new WebSocket(
            `ws://localhost:3000/api/v1/pages/${$page.params.pageId}/components`
        )

        ws.onopen = () => {
            console.log('Websocket connected')
        }

        ws.onmessage = ({ data }) => {
            let updatedComponents = JSON.parse(data)

            componentsWithMedia = updatedComponents
        }

        ws.onerror = (error) => {
            console.error('WebSocket error: ', error)
        }

        ws.onclose = () => {
            console.log('Websocket connection closed')
        }
    }
</script>

<div class="grid grid-cols-8">
    <div class="col-span-1 outline outline-neutral-500">
        <h1>{data.website.title}</h1>
        <details open>
            <summary>Pages</summary>
            <ul>
                {#each data.pages as { id, title }}
                    <li>
                        <a href={id}>{title}</a>
                    </li>
                {/each}
            </ul>
        </details>

        <h2>{data.page.title}</h2>

        <h3>Components</h3>
        <div draggable="true" class="outline" role="presentation">
            <h4>Text</h4>
            <form
                action="?/createComponent"
                method="post"
                use:enhance={() => {
                    return ({ update }) => {
                        update().finally(() => {
                            ws.send(JSON.stringify(componentsWithMedia))
                        })
                    }
                }}
            >
                <input type="hidden" name="type" value="text" />
                <label>
                    Content:
                    <textarea name="content" id="content" cols="30" rows="10"
                    ></textarea>
                </label>
                <button type="submit">Add</button>
            </form>
        </div>
        {#each Object.entries(mimeTypes) as [type, mimes]}
            {@const title = type.charAt(0).toUpperCase() + type.slice(1)}

            <div draggable="true" class="outline">
                <h4>{title}</h4>
                <form
                    action="?/createComponent"
                    method="post"
                    use:enhance={() => {
                        return ({ update }) => {
                            update().finally(() => {
                                ws.send(JSON.stringify(componentsWithMedia))
                            })
                        }
                    }}
                    enctype="multipart/form-data"
                >
                    <input type="hidden" name="type" value={type} />
                    <label>
                        {title}:
                        <input
                            name="file"
                            type="file"
                            accept={mimes.join(', ')}
                        />
                    </label>
                    <fieldset>
                        <legend>Select existing {type}:</legend>
                        <div>
                            {#each filteredMedia[type] as media}
                                <label>
                                    <input
                                        type="radio"
                                        name="existing-file"
                                        value={media.id}
                                    />
                                    {media.name}
                                </label>
                            {/each}
                        </div>
                    </fieldset>
                    <label>
                        Alt text:
                        <input name="alt-text" type="text" />
                    </label>
                    {#if ['audio', 'video'].includes(type)}
                        <label>
                            Loop:
                            <input name="is-looped" type="checkbox" />
                        </label>
                    {/if}
                    <button type="submit">Add</button>
                </form>
            </div>
        {/each}
    </div>

    <div role="presentation" class="outline outline-red-500 col-span-7">
        {#each componentsWithMedia as component (component.id)}
            <RenderComponent {component} />
            <form
                action="?/deleteComponent"
                method="post"
                use:enhance={() => {
                    return ({ update }) => {
                        update().finally(() => {
                            ws.send(JSON.stringify(componentsWithMedia))
                        })
                    }
                }}
            >
                <input type="hidden" name="id" value={component.id} />
                <button type="submit">Delete</button>
            </form>
        {/each}
    </div>
</div>
