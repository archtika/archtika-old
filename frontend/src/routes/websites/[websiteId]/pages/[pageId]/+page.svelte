<script lang="ts">
    import type { PageServerData } from './$types'
    import RenderComponent from '$lib/components/RenderComponent.svelte'
    import { enhance } from '$app/forms'

    export let data: PageServerData

    const mimeTypes = {
        image: ['image/jpeg', 'image/png', 'image/svg+xml'],
        audio: ['audio/mpeg', 'audio/wav', 'audio/aac', 'audio/ogg'],
        video: ['video/mp4', 'video/webm', 'video/ogg']
    }

    function filterMedia(type: string) {
        return data.media.filter((media: any) =>
            mimeTypes[type as keyof typeof mimeTypes].includes(media.mimetype)
        )
    }

    $: componentsWithMedia = data.components.map((component: any) => {
        if (['image', 'audio', 'video'].includes(component.type)) {
            return {
                ...component,
                media: data.media.find(
                    (media: any) => media.id === component.asset_id
                )
            }
        }

        return component
    })
</script>

<div>
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
    <div draggable="true" class="outline">
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

        <div draggable="true" class="outline">
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
                    <input name="file" type="file" accept={mimes.join(', ')} />
                </label>
                <fieldset>
                    <legend>Select existing {type}:</legend>
                    <div>
                        {#each filterMedia(type) as media}
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

<div style="border" class="outline outline-red-500">
    {#each componentsWithMedia as component}
        <RenderComponent {component} />
        <form action="?/deleteComponent" method="post" use:enhance>
            <input type="hidden" name="id" value={component.id} />
            <button type="submit">Delete</button>
        </form>
    {/each}
</div>
