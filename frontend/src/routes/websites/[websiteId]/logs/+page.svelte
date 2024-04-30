<script lang="ts">
import type { PageServerData } from "./$types";

export let data: PageServerData;
</script>

<h1>Logs for {data.website.title}</h1>

{#if data.logs.length === 0}
    <p>No logs yet.</p>
{:else}
    {#each data.logs as { created_at, user_id, change_summary, previous_value, new_value }}
        <hr />
        <article>
            <p><strong>Date and time:</strong> {created_at}</p>
            <p><strong>User:</strong> {user_id}</p>
            <p><strong>Change summary:</strong> {change_summary}</p>
            <p><strong>Previous value:</strong></p>
            <pre>{JSON.stringify(previous_value, null, 4)}</pre>
            <p><strong>New value:</strong></p>
            <pre>{JSON.stringify(new_value, null, 4)}</pre>
        </article>
    {/each}
{/if}
