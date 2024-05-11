<script lang="ts">
import { applyAction, deserialize, enhance } from "$app/forms";
import { invalidateAll } from "$app/navigation";
import { components, selectedComponent } from "$lib/stores";
import type { Component } from "$lib/types";
import DOMPurify from "isomorphic-dompurify";
import { Renderer, parse } from "marked";
import Resizer from "./Resizer.svelte";

export let component: Component;
export let styles: string;

const renderer = new Renderer();

renderer.image = (text) => text;

let purifiedTextContent = "";

// biome-ignore lint: This is a Svelte reactive value which automatically recomputes on dependency change
$: if (component.type === "text") {
	purifiedTextContent = DOMPurify.sanitize(
		parse(component.content.textContent ?? "", { renderer }) as string,
	);
}

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

	newWidth = Math.max(1, Math.round(newWidth / gridCellWidth)) * gridCellWidth;
	newHeight =
		Math.max(1, Math.round(newHeight / gridCellHeight)) * gridCellHeight;

	cols = newWidth / gridCellWidth;
	rows = newHeight / gridCellHeight;

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

	$components[index].col_end = $components[index].col_start + cols;
	$components[index].row_end = $components[index].row_start + rows;
	$components[index].col_end_span = cols;
	$components[index].row_end_span = rows;
}
</script>

<div
    draggable="true"
    on:dragstart
    on:click={handleComponentClick}
    role="presentation"
    style="{styles}{$selectedComponent === component.id ? "; outline: 0.25rem solid yellow" : ""}"
    data-component-id={component.id}
		data-component-type={component.type}
>
    <Resizer on:mousedown={handleResize} />

		{#if component.type === 'header'}
			<header></header>
		{/if}

		{#if component.type === 'footer'}
			<footer></footer>
		{/if}

    {#if component.type === 'text'}
        {@html purifiedTextContent}
    {/if}

    {#if component.type === 'image'}
        <img src={component.url} alt={component.content.altText} draggable="false" />
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
</div>

<style>
	div[data-component-id] {
		position: relative;
		border: 0.125rem solid black;
	}
</style>
