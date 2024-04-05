<script lang="ts">
    import type { PageServerData } from './$types'
    import RenderComponent from '$lib/components/RenderComponent.svelte'

    export let data: PageServerData

    const componentsWithMedia = data.components.map((component: any) => {
        if (['image', 'audio', 'video'].includes(component.type)) {
            return {
                ...component,
                media: data.media.find(
                    (media: any) => media.id === component.asset_id
                )
            }
        }

        return component
    })
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
    {#each componentsWithMedia as component}
        <RenderComponent {component} />
    {/each}
</div>
