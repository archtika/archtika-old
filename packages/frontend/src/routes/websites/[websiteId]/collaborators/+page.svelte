<script lang="ts">
  import { enhance } from "$app/forms";
  import DateTime from "$lib/components/DateTime.svelte";
  import type { PageServerData } from "./$types";

  export let data: PageServerData;

  function getPermissionLevel(level: number) {
    const permissionLevels = {
      10: "View",
      20: "Edit",
      30: "Manage",
    };

    return `${level} (${permissionLevels[level as keyof typeof permissionLevels]})`;
  }
</script>

<h1>
  Collaborators for <a href="/websites/{data.website.id}"
    >{data.website.title}</a
  >
</h1>

{#if data.collaborators.length === 0}
  <p>No collaborators added yet</p>
{:else}
  {#each data.collaborators as { user_id, permission_level, invited_at }}
    <div class="collaborator">
      <ul>
        <li>
          <strong>Date and time:</strong>
          <DateTime date={invited_at} />
        </li>
        <li>
          <strong>User:</strong>
          {user_id}
        </li>
        <li>
          <strong>Permission level:</strong>
          {getPermissionLevel(permission_level)}
        </li>
      </ul>
      <details>
        <summary>Change permissions</summary>
        <form method="post" action="?/updateCollaborator" use:enhance>
          <input
            type="hidden"
            id="update-collaborator-user-id"
            name="user-id"
            value={user_id}
          />
          <label>
            Permission level:
            <select
              id="update-collaborator-permission-level"
              name="permission-level"
              required
            >
              <option value="10">View</option>
              <option value="20">Edit</option>
              <option value="30">Manage</option>
            </select>
          </label>
          <button type="submit">Save</button>
        </form>
      </details>
      <form method="post" action="?/removeCollaborator" use:enhance>
        <input
          type="hidden"
          id="remove-collaborator-user-id"
          name="user-id"
          value={user_id}
        />
        <button type="submit">Remove</button>
      </form>
    </div>
  {/each}
{/if}

<style>
  .collaborator {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-block-start: 1rem;
    padding-block-start: 1rem;
    border-block-start: 0.125rem solid hsl(0 0% 50%);
  }
</style>
