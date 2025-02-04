<script lang="ts">
  import { applyAction, deserialize } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import {
    components,
    draggedComponentId,
    selectedComponent,
  } from "$lib/stores";
  import type { Component } from "common";
  import { ElementFactory } from "common";
  import Resizer from "./Resizer.svelte";

  export let component: Component;

  const element = new ElementFactory();

  function handleComponentClick(event: MouseEvent) {
    const target = (event.target as HTMLElement).closest("[data-component-id]");

    if (target) {
      $selectedComponent = target.getAttribute("data-component-id");
    }
  }

  let resizing = false;
  let startWidth: number;
  let startHeight: number;
  let startX: number;
  let startY: number;
  let cols: number;
  let rows: number;

  function handleResize(event: MouseEvent) {
    event.preventDefault();
    const element = event.target as HTMLElement;

    if (!element.parentElement) return;

    resizing = true;
    startX = event.clientX;
    startY = event.clientY;

    const rect = element.parentElement.getBoundingClientRect();
    startWidth = rect.width;
    startHeight = rect.height;

    window.addEventListener("mousemove", doDrag);
    window.addEventListener("mouseup", stopDrag);
  }

  function doDrag(event: MouseEvent) {
    if (!resizing) return;

    const dx = event.clientX - startX;
    const dy = event.clientY - startY;

    const gridCellWidth = (
      document.querySelector('[data-col="1"]') as HTMLElement
    ).offsetWidth;
    const gridCellHeight = (
      document.querySelector('[data-row="1"]') as HTMLElement
    ).offsetHeight;

    let newWidth = startWidth + dx;
    let newHeight = startHeight + dy;

    newHeight =
      Math.max(1, Math.round(newHeight / gridCellHeight)) * gridCellHeight;

    if (["header", "section", "footer"].includes(component.type)) {
      cols = 24;
      rows = newHeight / gridCellHeight;
    } else {
      newWidth =
        Math.max(1, Math.round(newWidth / gridCellWidth)) * gridCellWidth;
      cols = newWidth / gridCellWidth;
      rows = newHeight / gridCellHeight;
    }

    updateComponentGridArea();
  }

  async function stopDrag() {
    resizing = false;
    window.removeEventListener("mousemove", doDrag);
    window.removeEventListener("mouseup", stopDrag);

    const index = $components.findIndex((c) => c.id === component.id);

    const formData = new FormData();
    formData.append("component-id", `${$components[index].id}`);
    formData.append("row-start", `${$components[index].row_start}`);
    formData.append("col-start", `${$components[index].col_start}`);
    formData.append("row-end", `${$components[index].row_end}`);
    formData.append("col-end", `${$components[index].col_end}`);
    formData.append("row-end-span", `${$components[index].row_end_span}`);
    formData.append("col-end-span", `${$components[index].col_end_span}`);

    const response = await fetch("?/updateComponentPosition", {
      method: "POST",
      body: formData,
    });

    const result = deserialize(await response.text());

    if (result.type === "success") {
      await invalidateAll();
    }

    applyAction(result);
  }

  function updateComponentGridArea() {
    const index = $components.findIndex((c) => c.id === component.id);

    const oldRowEnd = $components[index].row_end;

    $components[index].col_end = $components[index].col_start + cols;
    $components[index].row_end = $components[index].row_start + rows;
    $components[index].col_end_span = cols;
    $components[index].row_end_span = rows;

    const rowShift = $components[index].row_end - oldRowEnd;

    for (const component of $components) {
      if (
        component.row_start > oldRowEnd &&
        ["header", "section"].includes($components[index].type)
      ) {
        component.row_start += rowShift;
        component.row_end += rowShift;
      }
    }
  }

  function highlightDragArea(
    event: DragEvent,
    componentId?: string,
    isRemoval = false
  ) {
    const componentData = $components.find((c) => c.id === componentId);
    if (!componentData) return;

    if (isRemoval) {
      const highlighterElements = document.querySelectorAll(
        ".drag-area-highlighter"
      );

      for (const element of highlighterElements) {
        (element as HTMLElement).style.display = "none";
      }

      return;
    }

    const target = event.target as HTMLElement;

    const { row_end_span, col_end_span } = componentData;

    const column = Number.parseInt(target.getAttribute("data-col") ?? "");

    const rect = target.parentElement?.getBoundingClientRect();
    if (!rect || !event) return;

    const y = event.clientY - rect.top;

    const gridCellHeight = (
      target.parentElement?.querySelector('[data-row="1"]') as HTMLElement
    ).offsetHeight;

    const row = Math.floor(y / gridCellHeight) + 1;

    const existingHighlighter = target.parentElement?.querySelector(
      ".drag-area-highlighter"
    ) as HTMLElement;

    if (!existingHighlighter) {
      const highlighter = document.createElement("div");
      highlighter.className = "drag-area-highlighter";
      highlighter.style.backgroundColor = "black";
      highlighter.style.opacity = "0.5";
      highlighter.style.outline = "0.125rem solid black";
      highlighter.style.outlineOffset = "0.25rem";
      highlighter.style.gridArea = `${row} / ${column} / ${row + row_end_span} / ${column + col_end_span}`;
      highlighter.style.pointerEvents = "none";

      target.parentElement?.appendChild(highlighter);

      return;
    }

    existingHighlighter.style.display = "";
    existingHighlighter.style.gridArea = `${row} / ${column} / ${row + row_end_span} / ${column + col_end_span}`;
  }

  function handleDragStart(event: DragEvent) {
    const componentId = (event.target as HTMLElement).getAttribute(
      "data-component-id"
    );

    if (componentId) {
      $draggedComponentId = componentId;
      event.dataTransfer?.setData("text/plain", componentId);
    }
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();

    /* Logical OR is required here because of the security model of the drag-and-drop API,
    which restricts access to the data during certain events */
    const componentId =
      event.dataTransfer?.getData("text/plain") || $draggedComponentId;

    if (!componentId) return;

    highlightDragArea(event, componentId, true);
    highlightDragArea(event, componentId);
  }

  function handleDragEnd(event: DragEvent) {
    const componentId =
      event.dataTransfer?.getData("text/plain") || $draggedComponentId;

    if (!componentId) return;

    highlightDragArea(event, componentId, true);
  }

  async function handleDrop(event: DragEvent, column: number) {
    event.preventDefault();

    const target = event.target as HTMLElement;
    const componentId = event.dataTransfer?.getData("text/plain");

    highlightDragArea(event, componentId, true);

    const index = $components.findIndex((component: Component) => {
      return component.id === componentId;
    });

    const parentId =
      target.parentElement?.getAttribute("data-component-id") ?? "";

    const rect = target.parentElement?.getBoundingClientRect();
    if (!rect) return;

    const y = event.clientY - rect.top;

    const gridCellHeight = (
      target.parentElement?.querySelector('[data-row="1"]') as HTMLElement
    ).offsetHeight;

    const row = Math.floor(y / gridCellHeight) + 1;

    $components[index] = {
      ...$components[index],
      row_start: row,
      col_start: column,
      row_end: row + ($components[index].row_end_span ?? 0),
      col_end: column + ($components[index].col_end_span ?? 0),
      parent_id: parentId,
    };

    const updateComponentFormData = new FormData();
    updateComponentFormData.append("id", `${$components[index].id}`);
    updateComponentFormData.append("type", `${$components[index].type}`);
    if (
      ["header", "footer", "section"].includes(
        target.parentElement?.getAttribute("data-component-type") ?? ""
      )
    ) {
      updateComponentFormData.append("parent-id", parentId);
    }
    updateComponentFormData.append("submission-type", "drop-event");

    const updateComponentResponse = await fetch("?/updateComponent", {
      method: "POST",
      body: updateComponentFormData,
    });

    const updateComponentResult = deserialize(
      await updateComponentResponse.text()
    );

    const formData = new FormData();
    formData.append("component-id", `${$components[index].id}`);
    formData.append("row-start", `${$components[index].row_start}`);
    formData.append("col-start", `${$components[index].col_start}`);
    formData.append("row-end", `${$components[index].row_end}`);
    formData.append("col-end", `${$components[index].col_end}`);
    formData.append("row-end-span", `${$components[index].row_end_span}`);
    formData.append("col-end-span", `${$components[index].col_end_span}`);

    const response = await fetch("?/updateComponentPosition", {
      method: "POST",
      body: formData,
    });

    const result = deserialize(await response.text());

    if (updateComponentResult.type === "success" && result.type === "success") {
      await invalidateAll();
    }

    applyAction(updateComponentResult);
    applyAction(result);
  }
</script>

<div
  draggable={!["header", "footer", "section"].includes(component.type)}
  on:dragstart={handleDragStart}
  on:dragend={handleDragEnd}
  on:click={handleComponentClick}
  class:component-container={["header", "footer", "section"].includes(
    component.type
  )}
  class:selected={$selectedComponent === component.id}
  class:non-nested={!["header", "footer", "section"].includes(component.type)}
  role="presentation"
  style="grid-area: {component.row_start ?? 1} / {component.col_start ??
    1} / {component.row_end ?? 1} / {component.col_end ??
    1}; grid-template-rows: repeat({component.row_end -
    component.row_start}, 2.5rem)"
  data-component-type={component.type}
  data-component-id={component.id}
  data-component-parent-id={component.parent_id}
  data-component-parent-type={component.parent_id
    ? $components.find((c) => c.id === component.parent_id)?.type
    : null}
>
  {#if ["header", "footer", "section"].includes(component.type)}
    <p class="component-indicator">
      <small>
        {component.type}
      </small>
    </p>

    {#each Array(component.row_end - component.row_start) as _, i}
      {@const row = i + 1}

      <div style="grid-area: {row} / 1 / {row + 1} / -1" data-row={row} />
    {/each}
    {#each Array(24) as _, i}
      {@const col = i + 1}

      <div
        style="grid-area: 1 / {col} / -1 / {col + 1};"
        data-col={col}
        on:dragover={handleDragOver}
        on:drop={(event) => handleDrop(event, col)}
        role="presentation"
      />
    {/each}

    {#if (component.children ?? []).length > 0}
      {#each component.children ?? [] as child}
        <svelte:self component={child} />
      {/each}
    {/if}
  {:else}
    {@html element.createElement(component)}
  {/if}
  <Resizer on:mousedown={handleResize} />
</div>

<style>
  div[data-component-id] {
    position: relative;
    border: 0.125rem solid black;
    background-color: white;
  }

  .component-container {
    display: grid;
    grid-template-columns: repeat(24, minmax(0, 1fr));
  }

  .selected {
    outline: 0.25rem solid yellow;
  }

  .non-nested {
    z-index: 10;
    padding-inline: 0.5rem;
    padding-block: 0.25rem;
  }

  .component-indicator {
    position: absolute;
    inset-block-start: 0;
    transform: translateY(-100%);
  }
</style>
