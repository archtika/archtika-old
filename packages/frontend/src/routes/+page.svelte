<script lang="ts">
  import { enhance } from "$app/forms";
  import DateTime from "$lib/components/DateTime.svelte";
  import type { PageServerData } from "./$types";

  export let data: PageServerData;
</script>

<h1>Websites</h1>

<details>
  <summary>Create website</summary>
  <form method="post" action="?/createWebsite" use:enhance>
    <label>
      Title:
      <input
        id="create-website-title"
        name="title"
        type="text"
        minlength="5"
        maxlength="50"
        required
      />
    </label>
    <label>
      Description:
      <textarea
        id="create-website-description"
        name="description"
        minlength="10"
        maxlength="200"
      ></textarea>
    </label>
    <button type="submit">Create</button>
  </form>
</details>

<section>
  <h2>Your creations</h2>

  {#if data.websites.length === 0}
    <p>No websites created yet.</p>
  {:else}
    {#each data.websites as { id, title, created_at, updated_at, last_modified_by }}
      <div>
        <h3>{title}</h3>
        <p>
          {#if updated_at}
            Last modified at: <DateTime date={updated_at} />
          {:else}
            Created at: <DateTime date={created_at} />
          {/if}
        </p>
        <a href="/websites/{id}">Edit</a>
      </div>
    {/each}
  {/if}
</section>

<section>
  <h2>Shared with you</h2>

  {#if data.sharedWebsites.length === 0}
    <p>No websites shared with you.</p>
  {:else}
    {#each data.sharedWebsites as { id, title, created_at, updated_at }}
      <div>
        <h3>{title}</h3>
        <p>
          {@html updated_at
            ? `Last modified at: <time datetime="${new Date(updated_at).toLocaleString("sv").replace(" ", "T")}">${new Date(updated_at).toLocaleString()}</time>`
            : `Created at: <time datetime="${new Date(created_at).toLocaleString("sv").replace(" ", "T")}">${new Date(created_at).toLocaleString()}`}
        </p>
        <div>
          <a href="/websites/{id}">Edit</a>
        </div>
      </div>
    {/each}
  {/if}
</section>
