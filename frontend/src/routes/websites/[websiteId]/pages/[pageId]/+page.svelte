<script lang="ts">
    import type { PageServerData } from './$types'
    import RenderComponent from '$lib/components/RenderComponent.svelte'
    import { enhance } from '$app/forms'
    import { page } from '$app/stores'
    import { browser } from '$app/environment'
    import type { Component } from '$lib/types'
    import { components, currentComponentSpan } from '$lib/stores'

    export let data: PageServerData

    const mimeTypes = {
        image: ['image/jpeg', 'image/png', 'image/svg+xml'],
        audio: ['audio/mpeg', 'audio/wav', 'audio/aac', 'audio/ogg'],
        video: ['video/mp4', 'video/webm', 'video/ogg']
    }

    $: $components = data.components

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

    function handleDrop(
        event: DragEvent,
        rowStart: number,
        colStart: number,
        rowEnd: number,
        colEnd: number
    ) {
        const componentId = event.dataTransfer?.getData('text/plain')

        const index = $components.findIndex((component: Component) => {
            return component.id === componentId
        })

        $components[index] = {
            ...$components[index],
            rowStart: rowStart,
            colStart: colStart,
            rowEnd: rowEnd + $currentComponentSpan.rowEnd,
            colEnd: colEnd + $currentComponentSpan.colEnd
        }
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

            const index = $components.findIndex((component: Component) => {
                return component.id === newComponent.id
            })

            if (index !== -1) {
                $components = [
                    ...$components.slice(0, index),
                    ...$components.slice(index + 1)
                ]
            } else {
                $components = [...$components, newComponent]
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

<div class="grid grid-cols-[fit-content(20ch),minmax(min(50vw,30ch),1fr)]">
    <div class="outline outline-green-500">
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

    <div
        class="outline outline-red-500 grid grid-cols-12 grid-rows-[repeat(12,10rem)]"
    >
        {#each Array(144) as _, i}
            {@const row = Math.floor(i / 12) + 1}
            {@const col = (i % 12) + 1}

            <div
                class="outline outline-blue-500"
                style="grid-area: {row} / {col} / {row} / {col}"
                on:dragover|preventDefault
                on:drop|preventDefault={(event) =>
                    handleDrop(event, row, col, row, col)}
                role="presentation"
            />
        {/each}
        {#each $components as component (component.id)}
            <RenderComponent
                {component}
                {mimeTypes}
                {getMedia}
                className="bg-pink-200"
                styles="grid-area: {component.rowStart ??
                    1} / {component.colStart ?? 1} / {component.rowEnd ??
                    1} / {component.colEnd ?? 1}"
                on:dragstart={handleDragStart}
            />
        {/each}
    </div>
</div>
