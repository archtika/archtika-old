<script lang="ts">
export let direction: "bottom-right";

// biome-ignore lint: This has to be declared with let, because it is a prop
export let className = "";
</script>

<div
    class="w-4 h-4 outline outline-black bg-white absolute {className}"
    data-resizer={direction}
    on:mousedown
    role="presentation"
/>
