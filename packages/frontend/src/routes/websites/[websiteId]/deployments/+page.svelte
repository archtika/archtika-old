<script lang="ts">
  import DateTime from "$lib/components/DateTime.svelte";
  import type { PageServerData } from "./$types";

  export let data: PageServerData;
</script>

<h1>Deployments for {data.website.title}</h1>

{#if data.deployments.length === 0}
  <p>No deployments yet.</p>
{:else}
  {#each data.deployments as { user_id, generation, file_hash, created_at }}
    <hr />
    <article>
      <p><strong>Date and time:</strong> <DateTime date={created_at} /></p>
      <p><strong>User:</strong> {user_id}</p>
      <p><strong>Generation:</strong> {generation}</p>
      <p><strong>File hash:</strong> <code>{file_hash}</code></p>
    </article>
  {/each}
{/if}
