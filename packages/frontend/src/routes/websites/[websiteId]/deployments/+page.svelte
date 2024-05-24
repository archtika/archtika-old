<script lang="ts">
  import DateTime from "$lib/components/DateTime.svelte";
  import type { PageServerData } from "./$types";

  export let data: PageServerData;

  const deploymentUrl = `http://localhost:18000/${data.account.id}/${data.website.id}`;
</script>

<h1>
  Deployments for <a href="/websites/{data.website.id}">{data.website.title}</a>
</h1>

{#if data.deployments.length === 0}
  <p>No deployments yet.</p>
{:else}
  <p>
    Your website is deployed at <a href={deploymentUrl} target="_blank">{deploymentUrl}</a>
  </p>

  <h2>History</h2>
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
