<script lang="ts">
    import { Renderer, parse } from 'marked'
    import DOMPurify from 'isomorphic-dompurify'
    import type { Component } from '$lib/types'
    import { enhance } from '$app/forms'
    import { components } from '$lib/stores'
    import Resizer from './Resizer.svelte'

    export let component: Component
    export let mimeTypes: Record<string, string[]>
    export let getMedia: (type: string) => { id: string; name: string }[]
    export let className = ''
    export let styles: string

    const renderer = new Renderer()

    renderer.image = function (text) {
        return text
    }

    $: purifiedTextContent = DOMPurify.sanitize(
        parse(component.content.textContent ?? '', { renderer }) as string
    )

    function handleResize(event: MouseEvent) {
        event.preventDefault()

        const target = event.target as HTMLElement
        const resizer = target.getAttribute('data-resizer')

        if (!target.parentElement) return

        const gridArea = getComputedStyle(
            target.parentElement
        ).getPropertyValue('grid-area')
        const currentComponentIndex = $components.findIndex(
            (component) =>
                component.id ===
                target.parentElement?.getAttribute('data-component-id')
        )

        let [rowStart, colStart, rowEnd, colEnd] = gridArea
            .split(' / ')
            .map(Number)

        switch (resizer) {
            case 'right':
                updateDimensions(1, 'col')
                break
            case 'left':
                updateDimensions(-1, 'col')
                break
            case 'bottom':
                updateDimensions(1, 'row')
                break
            case 'top':
                updateDimensions(-1, 'row')
                break
        }

        function updateDimensions(delta: number, type: 'row' | 'col') {
            if (type === 'col') {
                colEnd = adjustEnd(colStart, colEnd, delta)
                $components[currentComponentIndex].col_end_span = adjustSpan(
                    $components[currentComponentIndex].col_end_span,
                    delta
                )
            } else {
                rowEnd = adjustEnd(rowStart, rowEnd, delta)
                $components[currentComponentIndex].row_end_span = adjustSpan(
                    $components[currentComponentIndex].row_end_span,
                    delta
                )
            }

            $components[currentComponentIndex].row_start = rowStart
            $components[currentComponentIndex].col_start = colStart
            $components[currentComponentIndex].row_end = rowEnd
            $components[currentComponentIndex].col_end = colEnd

            if (!target.parentElement) return

            target.parentElement.style.gridArea = `${rowStart} / ${colStart} / ${rowEnd} / ${colEnd}`
        }

        function adjustEnd(start: number, end: number, delta: number) {
            return start === end ? end + 2 * delta : end + delta
        }

        function adjustSpan(span: number | undefined, delta: number) {
            return (span ?? 0) + delta
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
    <Resizer
        direction="right"
        className="bottom-1/2 -end-2 -translate-y-1/2 cursor-e-resize"
        on:mousedown={handleResize}
    />
    <Resizer
        direction="left"
        className="top-1/2 -end-2 translate-y-1/2 cursor-w-resize"
        on:mousedown={handleResize}
    />
    <Resizer
        direction="top"
        className="-bottom-2 end-1/2 -translate-x-1/2 cursor-n-resize"
        on:mousedown={handleResize}
    />
    <Resizer
        direction="bottom"
        className="-bottom-2 start-1/2 translate-x-1/2 cursor-s-resize"
        on:mousedown={handleResize}
    />

    {#if component.type === 'text'}
        {@html purifiedTextContent}

        <details>
            <summary>Update</summary>
            <form action="?/updateComponent" method="post" use:enhance>
                <input
                    type="hidden"
                    id="update-component-{component.id}-id"
                    name="id"
                    value={component.id}
                />
                <input
                    type="hidden"
                    id="update-component-{component.id}-type"
                    name="type"
                    value={component.type}
                />
                <label>
                    Content:
                    <textarea
                        id="update-component-{component.id}-content"
                        name="updated-content"
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
                <input
                    type="hidden"
                    id="update-component-{component.id}-type"
                    name="type"
                    value={component.type}
                />
                <input
                    type="hidden"
                    id="update-component-{component.id}-id"
                    name="id"
                    value={component.id}
                />

                <label>
                    {component.type.charAt(0).toUpperCase() +
                        component.type.slice(1)}:
                    <input
                        id="update-component-{component.id}-file"
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
                                    id="update-component-{component.id}-existing-file-{media.id}"
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
                        id="update-component-{component.id}-alt-text"
                        name="alt-text"
                        type="text"
                    />
                </label>
                {#if ['audio', 'video'].includes(component.type)}
                    <label>
                        Loop:
                        <input
                            id="update-component-{component.id}-is-looped"
                            name="is-looped"
                            type="checkbox"
                        />
                    </label>
                {/if}
                <button type="submit">Save</button>
            </form>
        </details>
    {/if}

    <form action="?/deleteComponent" method="post" use:enhance>
        <input
            type="hidden"
            id="delete-component-{component.id}"
            name="id"
            value={component.id}
        />
        <button type="submit">Delete</button>
    </form>

    <form action="?/updateComponentPosition" method="post" use:enhance>
        <input
            type="hidden"
            id="update-component-position-{component.id}-component-id"
            name="component-id"
            value={component.id}
        />
        <input
            type="hidden"
            id="update-component-position-{component.id}-row-start"
            name="row-start"
            value={component.row_start}
        />
        <input
            type="hidden"
            id="update-component-position-{component.id}-col-start"
            name="col-start"
            value={component.col_start}
        />
        <input
            type="hidden"
            id="update-component-position-{component.id}-row-end"
            name="row-end"
            value={component.row_end}
        />
        <input
            type="hidden"
            id="update-component-position-{component.id}-col-end"
            name="col-end"
            value={component.col_end}
        />
        <input
            type="hidden"
            id="update-component-position-{component.id}-row-end-span"
            name="row-end-span"
            value={component.row_end_span}
        />
        <input
            type="hidden"
            id="update-component-position-{component.id}-col-end-span"
            name="col-end-span"
            value={component.col_end_span}
        />
        <button type="submit">Update component position</button>
    </form>
</div>
