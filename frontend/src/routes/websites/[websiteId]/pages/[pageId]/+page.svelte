<script lang="ts">
    import type { PageServerData } from './$types'
    import RenderComponent from '$lib/components/RenderComponent.svelte'

    export let data: PageServerData
</script>

<div>
    <h1>{data.website.title}</h1>
    <details open>
        <summary>Pages</summary>
        <ul>
            {#each data.pages as { id, title }}
                <li>
                    <a href={id}>{title}</a>
                </li>
            {/each}
        </ul>
    </details>
    <h2>{data.page.title}</h2>

    <h3>Components</h3>
    <div draggable="true">
        <h4>Text</h4>
    </div>
</div>

<div>
    {#each data.components as component}
        <RenderComponent {component} />
    {/each}
</div>
