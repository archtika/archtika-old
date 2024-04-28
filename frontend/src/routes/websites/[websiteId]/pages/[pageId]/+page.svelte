<script lang="ts">
    import type { PageServerData } from './$types'
    import RenderComponent from '$lib/components/RenderComponent.svelte'
    import { enhance } from '$app/forms'
    import { page } from '$app/stores'
    import { browser } from '$app/environment'
    import type { Component } from '$lib/types'
    import { components } from '$lib/stores'

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
        event.preventDefault()

        const componentId = event.dataTransfer?.getData('text/plain')

        const index = $components.findIndex((component: Component) => {
            return component.id === componentId
        })

        $components[index] = {
            ...$components[index],
            row_start: rowStart,
            col_start: colStart,
            row_end: rowEnd + ($components[index].row_end_span ?? 0),
            col_end: colEnd + ($components[index].col_end_span ?? 0)
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
            const { operation_type, data: newComponent } = JSON.parse(data)

            console.log('Websocket event triggered!')

            switch (operation_type) {
                case 'create':
                    $components = [...$components, newComponent]
                    break
                case 'update':
                case 'update-position':
                    $components = $components.map((component) =>
                        component.id === newComponent.id
                            ? { ...component, ...newComponent }
                            : component
                    )
                    break
                case 'delete':
                    $components = $components.filter((component) => {
                        return component.id !== newComponent.id
                    })
                    break
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
                    <input
                        id="update-page-route"
                        name="route"
                        type="text"
                        value={data.page.route}
                    />
                </label>
                <label>
                    Title:
                    <input
                        id="update-page-title"
                        name="title"
                        type="text"
                        value={data.page.title}
                    />
                </label>
                <label>
                    Description:
                    <textarea id="update-page-description" name="description"
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
                <input
                    type="hidden"
                    id="create-component-text-type"
                    name="type"
                    value="text"
                />
                <label>
                    Content:
                    <textarea
                        id="create-component-text-content"
                        name="content"
                        cols="30"
                        rows="10"
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
                    <input
                        type="hidden"
                        id="create-component-{type}-type"
                        name="type"
                        value={type}
                    />
                    <label>
                        {title}:
                        <input
                            id="create-component-{type}-file"
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
                                        id="create-component-{type}-existing-file-{media.id}"
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
                        <input
                            id="create-component-{type}-alt-text"
                            name="alt-text"
                            type="text"
                        />
                    </label>
                    {#if ['audio', 'video'].includes(type)}
                        <label>
                            Loop:
                            <input
                                id="create-component-{type}-is-looped"
                                name="is-looped"
                                type="checkbox"
                            />
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
                on:dragover={(event) => event.preventDefault()}
                on:drop={(event) => handleDrop(event, row, col, row, col)}
                role="presentation"
            />
        {/each}
        {#each $components as component, i (i)}
            <RenderComponent
                {component}
                {mimeTypes}
                {getMedia}
                className="bg-pink-200 outline outline-black"
                styles="grid-area: {component.row_start ??
                    1} / {component.col_start ?? 1} / {component.row_end ??
                    1} / {component.col_end ?? 1}"
                on:dragstart={handleDragStart}
            />
        {/each}
    </div>
</div>
