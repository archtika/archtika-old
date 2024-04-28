<script lang="ts">
    export let direction: 'left' | 'top' | 'right' | 'bottom'
    export let className = ''
</script>

<div
    class="w-4 h-4 outline outline-black bg-white absolute {className}"
    data-resizer={direction}
    on:mousedown
    role="presentation"
/>
