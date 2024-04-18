<script lang="ts">
    import { Renderer, parse } from 'marked'
    import DOMPurify from 'isomorphic-dompurify'
    import type { Component } from '$lib/types'

    export let component: Component

    const renderer = new Renderer()

    renderer.image = function (text) {
        return text
    }

    let purifiedTextContent: string

    if (component.type === 'text') {
        purifiedTextContent = DOMPurify.sanitize(
            parse(component.content.textContent ?? '', { renderer }) as string
        )
    }
</script>

{#if component.type === 'text'}
    {@html purifiedTextContent}
{/if}

{#if component.type === 'image'}
    <img src={component.url} alt={component.content.altText} />
{/if}

{#if component.type === 'audio'}
    <audio
        controls
        title={component.content.altText}
        loop={component.content.isLooped}
    >
        <source src={component.url} />
    </audio>
{/if}

{#if component.type === 'video'}
    <video
        controls
        loop={component.content.isLooped}
        title={component.content.altText}
        src={component.url}
    >
        <track default kind="captions" srclang="en" />
    </video>
{/if}
