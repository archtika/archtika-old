<script lang="ts">
export let isNegativeRow: boolean;
</script>

<div
    data-resizer
    on:mousedown
    role="presentation"
    class:ne-resize={isNegativeRow}
/>

<style>
    div {
        position: absolute;
        border: 0.125rem solid black;
        inline-size: 1rem;
        block-size: 1rem;
        background-color: white;
        inset-block-end: 0;
        inset-inline-end: 0;
        cursor: se-resize;
    }

    .ne-resize {
        cursor: ne-resize;
        inset-block-start: 0;
    }
</style>