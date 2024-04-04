<script lang="ts">
    import { enhance } from '$app/forms'
    import type { PageServerData } from './$types'

    export let data: PageServerData
</script>

<h1>Websites</h1>

<details open>
    <summary>Create website</summary>
    <form method="post" action="?/createWebsite" use:enhance>
        <label>
            Title:
            <input name="title" type="text" />
        </label>
        <label>
            Description:
            <textarea name="description"></textarea>
        </label>
        <button type="submit">Create</button>
    </form>
</details>

<h2>Your creations</h2>

{#if data.websites.length === 0}
    <p>No websites created yet.</p>
{:else}
    {#each data.websites as { id, title, created_at, updatedAt }}
        <article>
            <h3>{title}</h3>
            <img
                src="https://picsum.photos/id/1/200/100"
                alt=""
                width="200"
                height="100"
            />
            <p>Last modified: {updatedAt ?? created_at}</p>
            <div>
                <a href="/websites/{id}">Edit</a>
            </div>
        </article>
    {/each}
{/if}

<h2>Shared with you</h2>
