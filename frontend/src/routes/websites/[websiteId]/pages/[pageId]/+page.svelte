<script lang="ts">
    import type { PageServerData } from './$types'
    import RenderComponent from '$lib/components/RenderComponent.svelte'
    import { enhance } from '$app/forms'
    import { page } from '$app/stores'
    import { browser } from '$app/environment'
    import type { Component } from '$lib/types'

    export let data: PageServerData

    const mimeTypes = {
        image: ['image/jpeg', 'image/png', 'image/svg+xml'],
        audio: ['audio/mpeg', 'audio/wav', 'audio/aac', 'audio/ogg'],
        video: ['video/mp4', 'video/webm', 'video/ogg']
    }

    $: components = data.components.map((component: Component) => ({
        ...component,
        zone: 0
    }))

    $: getMedia = (type: string) => {
        if (!data.media[type]) return []

        return data.media[type]
    }

    function handleDragStart(event: DragEvent) {
        const componentId = (event.target as HTMLElement).getAttribute(
            'data-component-id'
        )

        if (componentId) {
            event.dataTransfer?.setData('text/plain', componentId)
        }
    }

    function handleDrop(event: DragEvent) {
        const componentId = event.dataTransfer?.getData('text/plain')

        const zoneElement = (event.target as HTMLElement).closest(
            '[data-zone-id]'
        )
        const zoneId = zoneElement?.getAttribute('data-zone-id')

        components = components.map((component: Component) => {
            if (component.id === componentId && zoneId) {
                return { ...component, zone: parseInt(zoneId) }
            }
            return component
        })
    }

    let ws: WebSocket

    if (browser) {
        ws = new WebSocket(
            `ws://localhost:3000/api/v1/pages/${$page.params.pageId}/components`
        )

        ws.onopen = () => {
            console.log('Websocket connected')
        }

        ws.onmessage = ({ data }) => {
            let newComponent = JSON.parse(data)

            const index = components.findIndex((component: Component) => {
                return component.id === newComponent.id
            })

            if (index !== -1) {
                components = [
                    ...components.slice(0, index),
                    ...components.slice(index + 1)
                ]
            } else {
                components = [...components, newComponent]
            }
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

        <details open>
            <summary>Update page</summary>
            <form
                method="post"
                action="?/updatePage"
                use:enhance={() => {
                    return async ({ update }) => {
                        await update({ reset: false })
                    }
                }}
            >
                <label>
                    Route:
                    <input name="route" type="text" value={data.page.route} />
                </label>
                <label>
                    Title:
                    <input name="title" type="text" value={data.page.title} />
                </label>
                <label>
                    Description:
                    <textarea name="description"
                        >{data.page.meta_description}</textarea
                    >
                </label>
                <button type="submit">Update</button>
            </form>
        </details>

        <h3>Components</h3>
        <div class="outline">
            <h4>Text</h4>
            <form action="?/createComponent" method="post" use:enhance>
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

            <div class="outline">
                <h4>{title}</h4>
                <form
                    action="?/createComponent"
                    method="post"
                    use:enhance
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
                            {#each getMedia(type) as media}
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

    <div class="outline outline-red-500 col-span-7 grid grid-cols-12">
        {#each Array(components.length * 24) as _, i}
            <div
                class="outline outline-blue-500"
                data-zone-id={i}
                on:dragover|preventDefault
                on:drop|preventDefault={handleDrop}
                role="presentation"
            >
                {#each components as component (component.id)}
                    {#if component.zone === i}
                        <RenderComponent
                            {component}
                            {mimeTypes}
                            {getMedia}
                            on:dragstart={handleDragStart}
                        />
                    {/if}
                {/each}
            </div>
        {/each}
    </div>
</div>
