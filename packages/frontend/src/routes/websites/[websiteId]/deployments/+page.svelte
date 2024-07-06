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
    Your website is deployed at <a href={deploymentUrl} target="_blank"
      >{deploymentUrl}</a
    >
  </p>

  <section>
    <h2>History</h2>
    {#each data.deployments as { user_id, generation, file_hash, created_at }}
      <ul class="deployment">
        <li>
          <strong>Date and time:</strong>
          <DateTime date={created_at} />
        </li>
        <li>
          <strong>User:</strong>
          {user_id}
        </li>
        <li>
          <strong>Generation:</strong>
          {generation}
        </li>
        <li>
          <strong>File hash:</strong> <code>{file_hash}</code>
        </li>
        <li>
          <a
            href="http://localhost:3000/api/v1/websites/{data.website
              .id}/deployments/{generation}/download"
            download>Download website</a
          >
        </li>
      </ul>
    {/each}
  </section>
{/if}

<style>
  .deployment {
    margin-block-start: 1rem;
    padding-block-start: 1rem;
    border-block-start: 0.125rem solid hsl(0 0% 50%);
  }
</style>
