<script lang="ts">
    import { Renderer, parse } from 'marked'
    import DOMPurify from 'isomorphic-dompurify'
    import type { Component } from '$lib/types'
    import { enhance } from '$app/forms'
    import { components, currentComponentSpan } from '$lib/stores'

    export let component: Component
    export let mimeTypes: Record<string, string[]>
    export let getMedia: (type: string) => { id: string; name: string }[]
    export let className = ''
    export let styles: string

    const renderer = new Renderer()

    renderer.image = function (text) {
        return text
    }

    let purifiedTextContent: string

    if (component.type === 'text') {
        purifiedTextContent = DOMPurify.sanitize(
            parse(component.content.textContent ?? '', { renderer }) as string
        )
    }

    function handleResize(event: MouseEvent) {
        const target = event.target as HTMLElement

        switch (target.getAttribute('data-resizer')) {
            case 'right':
                {
                    console.log('Right!')

                    if (!target.parentElement) return

                    const gridArea = getComputedStyle(
                        target.parentElement
                    ).getPropertyValue('grid-area')

                    let [rowStart, colStart, rowEnd, colEnd] = gridArea
                        .split(' / ')
                        .map(Number)

                    if (colEnd === colStart) {
                        colEnd += 2
                        $currentComponentSpan.colEnd += 2
                    } else {
                        colEnd += 1
                        $currentComponentSpan.colEnd += 1
                    }

                    target.parentElement.style.gridArea = `${rowStart} / ${colStart} / ${rowEnd} / ${colEnd}`
                }
                break
            case 'bottom':
                {
                    console.log('Bottom!')

                    if (!target.parentElement) return

                    const gridArea = getComputedStyle(
                        target.parentElement
                    ).getPropertyValue('grid-area')

                    let [rowStart, colStart, rowEnd, colEnd] = gridArea
                        .split(' / ')
                        .map(Number)

                    if (rowEnd === rowStart) {
                        rowEnd += 2
                        $currentComponentSpan.rowEnd += 2
                    } else {
                        rowEnd += 1
                        $currentComponentSpan.rowEnd += 1
                    }

                    target.parentElement.style.gridArea = `${rowStart} / ${colStart} / ${rowEnd} / ${colEnd}`
                }
                break
        }
    }
</script>

<div
    draggable="true"
    on:dragstart
    role="presentation"
    class="{className} relative"
    style={styles}
    data-component-id={component.id}
>
    <div
        class="w-4 h-4 rounded-full outline outline-black bg-white absolute top-1/2 -end-2 -translate-y-1/2 cursor-e-resize"
        data-resizer="right"
        on:mousedown|preventDefault={handleResize}
        role="presentation"
    />
    <div
        class="w-4 h-4 rounded-full outline outline-black bg-white absolute -bottom-2 end-1/2 translate-x-1/2 cursor-s-resize"
        data-resizer="bottom"
        on:mousedown|preventDefault={handleResize}
        role="presentation"
    />

    {#if component.type === 'text'}
        {@html purifiedTextContent}

        <details>
            <summary>Update</summary>
            <form action="?/updateComponent" method="post" use:enhance>
                <input type="hidden" name="id" value={component.id} />
                <input type="hidden" name="type" value={component.type} />
                <label>
                    Content:
                    <textarea
                        name="updated-content"
                        id="updated-content"
                        cols="30"
                        rows="10">{component.content.textContent}</textarea
                    >
                </label>
                <button type="submit">Update</button>
            </form>
        </details>
    {/if}

    {#if component.type === 'image'}
        <img src={component.url} alt={component.content.altText} />
    {/if}

    {#if component.type === 'audio'}
        <audio
            controls
            title={component.content.altText}
            loop={component.content.isLooped}
        >
            <source src={component.url} />
        </audio>
    {/if}

    {#if component.type === 'video'}
        <video
            controls
            loop={component.content.isLooped}
            title={component.content.altText}
            src={component.url}
        >
            <track default kind="captions" srclang="en" />
        </video>
    {/if}

    {#if ['image', 'video', 'audio'].includes(component.type)}
        <details>
            <summary>Update</summary>
            <form
                action="?/updateComponent"
                method="post"
                use:enhance
                enctype="multipart/form-data"
            >
                <input type="hidden" name="type" value={component.type} />
                <input type="hidden" name="id" value={component.id} />

                <label>
                    {component.type.charAt(0).toUpperCase() +
                        component.type.slice(1)}:
                    <input
                        name="file"
                        type="file"
                        accept={mimeTypes[component.type].join(', ')}
                    />
                </label>
                <fieldset>
                    <legend>Select existing {component.type}:</legend>
                    <div>
                        {#each getMedia(component.type) as media}
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
                {#if ['audio', 'video'].includes(component.type)}
                    <label>
                        Loop:
                        <input name="is-looped" type="checkbox" />
                    </label>
                {/if}
                <button type="submit">Add</button>
            </form>
        </details>
    {/if}

    <form action="?/deleteComponent" method="post" use:enhance>
        <input type="hidden" name="id" value={component.id} />
        <button type="submit">Delete</button>
    </form>
</div>
