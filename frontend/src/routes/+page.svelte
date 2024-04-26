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
    {#each data.websites as { id, title, created_at, updated_at, last_modified_by }}
        <article>
            <h3>{title}</h3>
            <img
                src="https://picsum.photos/id/1/200/100"
                alt=""
                width="200"
                height="100"
            />
            <p>
                {@html updated_at
                    ? `Last modified at: <time datetime="${new Date(updated_at).toLocaleString('sv').replace(' ', 'T')}">${new Date(updated_at).toLocaleString()}</time>`
                    : `Created at: <time datetime="${new Date(created_at).toLocaleString('sv').replace(' ', 'T')}">${new Date(created_at).toLocaleString()}`}
            </p>
            <div>
                <a href="/websites/{id}">Edit</a>
            </div>
        </article>
    {/each}
{/if}

<h2>Shared with you</h2>

{#if data.sharedWebsites.length === 0}
    <p>No websites shared with you.</p>
{:else}
    {#each data.sharedWebsites as { id, title, created_at, updated_at }}
        <article>
            <h3>{title}</h3>
            <img
                src="https://picsum.photos/id/1/200/100"
                alt=""
                width="200"
                height="100"
            />
            <p>
                {@html updated_at
                    ? `Last modified at: <time datetime="${new Date(updated_at).toLocaleString('sv').replace(' ', 'T')}">${new Date(updated_at).toLocaleString()}</time>`
                    : `Created at: <time datetime="${new Date(created_at).toLocaleString('sv').replace(' ', 'T')}">${new Date(created_at).toLocaleString()}`}
            </p>
            <div>
                <a href="/websites/{id}">Edit</a>
            </div>
        </article>
    {/each}
{/if}
