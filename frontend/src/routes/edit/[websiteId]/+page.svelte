<script lang="ts">
    import type { PageServerData } from './$types'
    import { page } from '$app/stores'

    export let data: PageServerData
</script>

<h1>Overview for {data.website.title}</h1>

<h2>Website settings</h2>

<form>
    <label>
        Title:
        <input type="text" value={data.website.title} />
    </label>
    <label>
        Description:
        <textarea>{data.website.meta_description}</textarea>
    </label>
    <button type="submit">Save</button>
</form>

<details open>
    <summary>Add collaborators</summary>
    <form>
        <label>
            Website id:
            <input type="text" value={data.website.id} disabled />
        </label>
        <label>
            User id:
            <input type="text" />
        </label>
        <button type="submit">Add</button>
    </form>
</details>

<h2>Pages</h2>

<details open>
    <summary>Create new page</summary>
    <form>
        <label>
            Route:
            <input type="text" />
        </label>
        <label>
            Title:
            <input type="text" />
        </label>
        <label>
            Description:
            <textarea></textarea>
        </label>
        <button type="submit">Create</button>
    </form>
</details>

{#each data.pages as { id, title }}
    <article>
        <h3>{title}</h3>
        <a href="{$page.url}/pages/{id}">Edit</a>
    </article>
{/each}
