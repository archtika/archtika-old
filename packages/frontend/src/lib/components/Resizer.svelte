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
    inline-size: 1.5rem;
    block-size: 1.5rem;
    background-color: white;
    inset-block-end: -0.75rem;
    inset-inline-end: -0.75rem;
    cursor: se-resize;
    transform: rotate(45deg);
  }

  .ne-resize {
    cursor: ne-resize;
    inset-block-start: -0.75rem;
  }
</style>
