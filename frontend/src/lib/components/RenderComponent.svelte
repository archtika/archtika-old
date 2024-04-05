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

{#if component.type === 'image'}
    <img src={component.media.url} alt={component.content.altText} />
{/if}

{#if component.type === 'audio'}
    <audio controls title={component.content.altText}>
        <source src={component.media.url} />
    </audio>
{/if}

{#if component.type === 'video'}
    <video
        controls
        loop={component.content.isLooped}
        title={component.content.altText}
        src={component.media.url}
    >
        <track default kind="captions" srclang="en" />
    </video>
{/if}
