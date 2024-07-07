<script lang="ts">
  import { page } from "$app/stores";
  import type { PageServerData } from "./$types";

  export let data: PageServerData;
</script>

<h1>
  Pages for <a href="/websites/{data.website.id}">{data.website.title}</a>
</h1>

{#if data.pages.length === 0}
  <p>No pages created yet.</p>
{:else}
  {#each data.pages as { id, title }}
    <div class="page">
      <h3>{title}</h3>
      <a href="/websites/{$page.params.websiteId}/pages/{id}">Edit</a>
    </div>
  {/each}
{/if}

<style>
  .page {
    margin-block-start: 1rem;
    padding-block-start: 1rem;
    border-block-start: 0.125rem solid hsl(0 0% 50%);
  }
</style>