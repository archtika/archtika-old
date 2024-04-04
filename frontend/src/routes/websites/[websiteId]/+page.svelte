<script lang="ts">
    import type { PageServerData } from './$types'
    import { page } from '$app/stores'
    import { enhance } from '$app/forms'

    export let data: PageServerData
</script>

<h1>Overview for {data.website.title}</h1>

<h2>Website settings</h2>

<form
    method="post"
    action="?/updateWebsite"
    use:enhance={() => {
        return async ({ update }) => {
            await update({ reset: false })
        }
    }}
>
    <label>
        Title:
        <input type="text" name="title" value={data.website.title} />
    </label>
    <label>
        Description:
        <textarea name="description">{data.website.meta_description}</textarea>
    </label>
    <button type="submit">Save</button>
</form>

<h3>Collaborators</h3>

<details open>
    <summary>Add collaborator</summary>
    <form method="post" action="?/addCollaborator" use:enhance>
        <label>
            User id:
            <input type="text" name="user-id" />
        </label>
        <label>
            Permission level:
            <select name="permission-level">
                <option value="10">View</option>
                <option value="20">Edit</option>
                <option value="30">Manage</option>
            </select>
        </label>
        <button type="submit">Add</button>
    </form>
</details>

{#if data.collaborators.length === 0}
    <p>No collaborators added yet</p>
{:else}
    {#each data.collaborators as { user_id, permission_level }}
        <article>
            <p>User id: {user_id}</p>
            <p>Permission level: {permission_level}</p>
            <details>
                <summary>Change permissions</summary>
                <form method="post" action="?/updateCollaborator" use:enhance>
                    <input type="hidden" name="user-id" value={user_id} />
                    <label>
                        Permission level:
                        <select name="permission-level">
                            <option value="10">View</option>
                            <option value="20">Edit</option>
                            <option value="30">Manage</option>
                        </select>
                    </label>
                    <button type="submit">Save</button>
                </form>
            </details>
            <form method="post" action="?/removeCollaborator" use:enhance>
                <input type="hidden" name="user-id" value={user_id} />
                <button type="submit">Remove</button>
            </form>
        </article>
    {/each}
{/if}

<h3>Logs</h3>

<a href="{$page.url}/logs">View full change-log</a>

<h3>Delete</h3>

<form method="post" action="?/deleteWebsite" use:enhance>
    <button type="submit">Delete website</button>
</form>

<h2>Pages</h2>

<details open>
    <summary>Create new page</summary>
    <form method="post" action="?/createPage" use:enhance>
        <label>
            Route:
            <input name="route" type="text" />
        </label>
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

{#if data.pages.length === 0}
    <p>No pages created yet.</p>
{:else}
    {#each data.pages as { id, title }}
        <article>
            <h3>{title}</h3>
            <a href="{$page.url}/pages/{id}">Edit</a>
        </article>
    {/each}
{/if}
