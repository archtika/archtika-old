<script lang="ts">
import type { PageServerData } from "./$types";

export let data: PageServerData;

interface DiffObject {
	[key: string]: string;
}

function generateDiffHtml(
	previous: DiffObject,
	current: DiffObject,
	indent = 0,
) {
	let diffHtml = "";
	const indentString = "\t".repeat(indent);
	let innerHtml = "";

	if (!previous || !current) {
		const validObject = previous || current;

		return JSON.stringify(validObject, null, 4);
	}

	const allKeys = new Set([...Object.keys(previous), ...Object.keys(current)]);

	for (const key of allKeys) {
		let prevValue = previous[key];
		let currValue = current[key];

		if (
			prevValue &&
			currValue &&
			typeof prevValue === "object" &&
			typeof currValue === "object"
		) {
			innerHtml += `${indentString}\t"${key}": ${generateDiffHtml(
				prevValue,
				currValue,
				indent + 1,
			)}`;
		} else if (prevValue !== currValue) {
			prevValue = String(prevValue).trim();
			currValue = String(currValue).trim();

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
            <pre>{@html generateDiffHtml(previous_value, new_value)}</pre>
        </article>
    {/each}
{/if}
