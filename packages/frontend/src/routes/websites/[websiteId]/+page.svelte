<script lang="ts">
  import { enhance } from "$app/forms";
  import { page } from "$app/stores";
  import type { PageServerData } from "./$types";

  export let data: PageServerData;
</script>

<h1>Overview for {data.website.title}</h1>

<section>
  <h2>Website settings</h2>

  <form
    method="post"
    action="?/updateWebsite"
    use:enhance={() => {
      return async ({ update }) => {
        await update({ reset: false });
      };
    }}
  >
    <label>
      Title:
      <input
        type="text"
        id="update-website-title"
        name="title"
        value={data.website.title}
        minlength="5"
        maxlength="50"
        required
      />
    </label>
    <label>
      Description:
      <textarea
        id="update-website-description"
        name="description"
        minlength="10"
        maxlength="200">{data.website.meta_description}</textarea
      >
    </label>
    <button type="submit">Save</button>
  </form>

  <details>
    <summary>Delete</summary>
    <form method="post" action="?/deleteWebsite" use:enhance>
      <button type="submit">Delete website</button>
    </form>
  </details>
</section>

<section>
  <h2>Collaborators</h2>

  <details>
    <summary>Add collaborator</summary>
    <form method="post" action="?/addCollaborator" use:enhance>
      <label>
        User id:
        <input
          type="text"
          id="add-collaborator-user-id"
          name="user-id"
          pattern={"[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}"}
          required
        />
      </label>
      <label>
        Permission level:
        <select
          id="add-collaborator-permission-level"
          name="permission-level"
          required
        >
          <option value="10">View</option>
          <option value="20">Edit</option>
          <option value="30">Manage</option>
        </select>
      </label>
      <button type="submit">Add</button>
    </form>
  </details>

  <a href="/websites/{$page.params.websiteId}/collaborators">View collaborators</a>
</section>

<section>
  <h2>Logs</h2>

  <a href="/websites/{$page.params.websiteId}/logs">View change-log</a>
</section>

<section>
  <h2>Deployments</h2>

  <form method="post" action="?/generateWebsite" use:enhance>
    <button type="submit">Deploy website</button>
  </form>

  <a href="/websites/{$page.params.websiteId}/deployments"
    >View deployments</a
  >
</section>

<section>
  <h2>Pages</h2>

  <details>
    <summary>Create new page</summary>
    <form method="post" action="?/createPage" use:enhance>
      <label>
        Route:
        <input
          id="create-page-route"
          name="route"
          type="text"
          minlength="1"
          maxlength="200"
          pattern={"^/(|[a-z0-9]+(?:-[a-z0-9]+)*(?:/[a-z0-9]+(?:-[a-z0-9]+)*)*)$"}
          required
        />
      </label>
      <label>
        Title:
        <input
          id="create-page-title"
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
          id="create-page-description"
          name="description"
          minlength="10"
          maxlength="200"
        ></textarea>
      </label>
      <button type="submit">Create</button>
    </form>
  </details>

  {#if data.pages.length === 0}
    <p>No pages created yet.</p>
  {:else}
    {#each data.pages as { id, title }}
      <div>
        <h3>{title}</h3>
        <a href="/websites/{$page.params.websiteId}/pages/{id}">Edit</a>
      </div>
    {/each}
  {/if}
</section>
