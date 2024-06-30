<script lang="ts">
  import { applyAction, deserialize } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import { components, selectedComponent } from "$lib/stores";
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

    const gridCellSize = document.querySelector(`[data-zone="1"]`);
    if (!gridCellSize) return;

    const rect = gridCellSize.getBoundingClientRect();
    const gridCellWidth = rect.width;
    const gridCellHeight = rect.height;

    let newWidth = startWidth + dx;
    let newHeight = startHeight + dy;

    newHeight =
      Math.max(1, Math.round(newHeight / gridCellHeight)) * gridCellHeight;

    if (["header", "section", "footer"].includes(component.type)) {
      cols = 12;
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
    target: HTMLElement,
    componentId?: string,
    isRemoval = false
  ) {
    const componentContainer = target.closest(
      ".component-container"
    ) as HTMLElement;

    if (isRemoval) {
      for (const zoneElement of componentContainer.querySelectorAll(
        "[data-zone]"
      )) {
        (zoneElement as HTMLElement).style.border = "";
      }

      return;
    }

    const componentData = $components.find((c) => c.id === componentId);

    if (!componentData) return;

    const { row_end_span, col_end_span } = componentData;

    const targetZone = Number.parseInt(target.getAttribute("data-zone") ?? "");

    for (let row = 0; row < row_end_span; row++) {
      for (let col = 0; col < col_end_span; col++) {
        const zoneNumber = targetZone + row * 12 + col;

        const zoneElement = componentContainer?.querySelector(
          `[data-zone="${zoneNumber}"]`
        ) as HTMLElement;

        if (zoneElement) {
          zoneElement.style.border = "0.125rem solid black";
        }
      }
    }
  }

  let draggedComponentId: string | null = null;

  function handleDragStart(event: DragEvent) {
    const componentId = (event.target as HTMLElement).getAttribute(
      "data-component-id"
    );

    if (componentId) {
      draggedComponentId = componentId;
      event.dataTransfer?.setData("text/plain", componentId);
    }
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
  }

  function handleDragEnter(event: DragEvent) {
    const target = event.target as HTMLElement;
    const componentId =
      event.dataTransfer?.getData("text/plain") || draggedComponentId;

    if (!componentId) return;

    highlightDragArea(target, componentId, true);
    highlightDragArea(target, componentId);
  }

  function handleDragEnd(event: DragEvent) {
    const target = event.target as HTMLElement;
    const componentId =
      event.dataTransfer?.getData("text/plain") || draggedComponentId;

    if (!componentId) return;

    highlightDragArea(target, componentId, true);
    draggedComponentId = null;
  }

  async function handleDrop(
    event: DragEvent,
    rowStart: number,
    colStart: number,
    rowEnd: number,
    colEnd: number
  ) {
    event.preventDefault();

    const target = event.target as HTMLElement;
    const componentId =
      event.dataTransfer?.getData("text/plain") || draggedComponentId;

    const index = $components.findIndex((component: Component) => {
      return component.id === componentId;
    });

    const parentId =
      target.parentElement?.getAttribute("data-component-id") ?? "";

    $components[index] = {
      ...$components[index],
      row_start: rowStart,
      col_start: colStart,
      row_end: rowEnd + ($components[index].row_end_span ?? 0),
      col_end: colEnd + ($components[index].col_end_span ?? 0),
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

    draggedComponentId = null;
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
    1} / {component.row_end ?? 1} / {component.col_end ?? 1}"
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

    {#each Array((component.row_end - component.row_start || 1) * 12) as _, i}
      {@const row = Math.floor(i / 12) + 1}
      {@const col = (i % 12) + 1}

      <div
        style="grid-area: {row} / {col} / {row} / {col}"
        data-zone={i + 1}
        on:dragover={handleDragOver}
        on:dragenter={handleDragEnter}
        on:drop={(event) => handleDrop(event, row, col, row, col)}
        on:drag
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
    grid-template-columns: repeat(12, minmax(0, 1fr));
    grid-auto-rows: 2.5rem;
  }

  .selected {
    outline: 0.5rem solid yellow;
  }

  .non-nested {
    z-index: 10;
  }

  .component-indicator {
    position: absolute;
    inset-block-start: 0;
    transform: translateY(-100%);
  }
</style>
