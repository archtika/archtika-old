<script lang="ts">
    import { Renderer, parse } from 'marked'
    import DOMPurify from 'isomorphic-dompurify'
    import type { Component } from '$lib/types'
    import { enhance } from '$app/forms'

    export let component: Component
    export let mimeTypes: Record<string, string[]>
    export let getMedia: (type: string) => { id: string; name: string }[]

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
</script>

<div>
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
