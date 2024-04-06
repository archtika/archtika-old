<script lang="ts">
    import type { PageServerData } from './$types'
    import RenderComponent from '$lib/components/RenderComponent.svelte'
    import { enhance } from '$app/forms'

    export let data: PageServerData

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
    <div draggable="true">
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
    <div draggable="true">
        <h4>Image</h4>
        <form
            action="?/createComponent"
            method="post"
            use:enhance
            enctype="multipart/form-data"
        >
            <input type="hidden" name="type" value="image" />
            <label>
                Image:
                <input
                    name="file"
                    type="file"
                    accept="image/jpeg, image/png, image/svg+xml"
                />
            </label>
            <label>
                Alt text:
                <input name="alt-text" type="text" />
            </label>
            <button type="submit">Add</button>
        </form>
    </div>
    <div draggable="true">
        <h4>Audio</h4>
        <form
            action="?/createComponent"
            method="post"
            use:enhance
            enctype="multipart/form-data"
        >
            <input type="hidden" name="type" value="audio" />
            <label>
                Audio:
                <input
                    name="file"
                    type="file"
                    accept="audio/mpeg, audio/wav, audio/aac, audio/ogg"
                />
            </label>
            <label>
                Alt text:
                <input name="alt-text" type="text" />
            </label>
            <label>
                Loop:
                <input name="is-looped" type="checkbox" />
            </label>
            <button type="submit">Add</button>
        </form>
    </div>
    <div draggable="true">
        <h4>Video</h4>
        <form
            action="?/createComponent"
            method="post"
            use:enhance
            enctype="multipart/form-data"
        >
            <input type="hidden" name="type" value="video" />
            <label>
                Video:
                <input
                    name="file"
                    type="file"
                    accept="video/mp4, video/webm, video/ogg"
                />
            </label>
            <label>
                Alt text:
                <input name="alt-text" type="text" />
            </label>
            <label>
                Loop:
                <input name="is-looped" type="checkbox" />
            </label>
            <button type="submit">Add</button>
        </form>
    </div>
</div>

<div style="border">
    {#each componentsWithMedia as component}
        <RenderComponent {component} />
    {/each}
</div>
