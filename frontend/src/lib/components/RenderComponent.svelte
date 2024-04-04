<script lang="ts">
    import { onMount } from 'svelte'

    export let component: any

    let assetUrl: string
    let assetName: string

    onMount(async () => {
        if (component.type !== 'image') {
            return
        }

        const assetData = await fetch(`/media?id=${component.asset_id}`)
        const assetRes = await assetData.json()

        assetUrl = assetRes.url
        assetName = assetRes.name
    })
</script>

{#if component.type === 'text'}
    <p>{component.content.textContent}</p>
{/if}

{#if component.type === 'button'}
    <a href={component.content.hyperlink}>{component.content.label}</a>
{/if}

{#if component.type === 'accordion'}
    <details open={component.content.isOpen}>
        <summary>{component.content.title}</summary>
        <p>{component.content.accordionContent}</p>
    </details>
{/if}

{#if component.type === 'image'}
    <img src={assetUrl} alt={assetName} />
{/if}
