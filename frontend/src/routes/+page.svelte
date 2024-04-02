<script lang="ts">
    import type { PageData } from './$types'

    export let data: PageData
</script>

<h1>Websites</h1>

<h2>Your creations</h2>

{#each data.websites as { id, title, created_at, updatedAt }}
    <article>
        <h3>{title}</h3>
        <img
            src="https://picsum.photos/id/1/200/100"
            alt=""
            width="200"
            height="100"
        />
        <p>Last modified: {updatedAt ?? created_at}</p>
        <div>
            <a href="/edit/{id}">Edit</a>
            <a href="/view/{id}">View</a>
            <a href="/generate/{id}">Generate</a>
        </div>
    </article>
{/each}

<h2>Shared with you</h2>
