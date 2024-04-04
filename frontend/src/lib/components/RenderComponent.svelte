<script lang="ts">
    export let component: any
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
