<script lang="ts">
export let direction: "bottom-right";

// biome-ignore lint: This has to be declared with let, because it is a prop
export let className = "";
</script>

<div
    class="w-5 h-5 border border-neutral-900 bg-white absolute {className}"
    data-resizer={direction}
    on:mousedown
    role="presentation"
/>
