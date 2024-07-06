<script lang="ts">
  import DateTime from "$lib/components/DateTime.svelte";
  import type { PageServerData } from "./$types";

  export let data: PageServerData;

  interface DiffObject {
    [key: string]: string;
  }

  function generateDiffHtml(
    previous: DiffObject,
    current: DiffObject,
    indent = 0
  ) {
    let diffHtml = "";
    const indentString = "\t".repeat(indent);
    let innerHtml = "";

    if (!previous || !current) {
      const validObject = previous || current;

      return JSON.stringify(validObject, null, 4);
    }

    const allKeys = new Set([
      ...Object.keys(previous),
      ...Object.keys(current),
    ]);

    for (const key of allKeys) {
      const prevValue = previous[key];
      const currValue = current[key];

      if (
        prevValue &&
        currValue &&
        typeof prevValue === "object" &&
        typeof currValue === "object"
      ) {
        innerHtml += `${indentString}\t"${key}": ${generateDiffHtml(
          prevValue,
          currValue,
          indent + 1
        )}`;
      } else if (prevValue !== currValue) {
        innerHtml += `${indentString}\t<del>"${key}": "${prevValue}"</del>\n`;
        innerHtml += `${indentString}\t<ins>"${key}": "${currValue}"</ins>\n`;
      } else {
        innerHtml += `${indentString}\t"${key}": "${currValue}",\n`;
      }
    }

    diffHtml += `{\n${innerHtml}${indentString}}\n`;
    return diffHtml;
  }
</script>

<h1>Logs for <a href="/websites/{data.website.id}">{data.website.title}</a></h1>

{#if data.logs.length === 0}
  <p>No logs yet.</p>
{:else}
  {#each data.logs as { created_at, user_id, change_summary, previous_value, new_value }}
    <ul class="log">
      <li>
        <strong>Date and time:</strong>
        <DateTime date={created_at} />
      </li>
      <li>
        <strong>User:</strong>
        {user_id}
      </li>
      <li>
        <strong>Change summary:</strong>
        {change_summary}
        <pre>{@html generateDiffHtml(previous_value, new_value)}</pre>
      </li>
    </ul>
  {/each}
{/if}

<style>
  .log {
    margin-block-start: 1rem;
    padding-block-start: 1rem;
    border-block-start: 0.125rem solid hsl(0 0% 50%);
  }
</style>