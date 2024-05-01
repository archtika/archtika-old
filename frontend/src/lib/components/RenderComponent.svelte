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

// biome-ignore lint: This has to be declared with let, because it is a prop
export let className = "";

const renderer = new Renderer();

renderer.image = (text) => text;

// biome-ignore lint: This is a Svelte reactive value which automatically recomputes on dependency change
$: purifiedTextContent = DOMPurify.sanitize(
	parse(component.content.textContent ?? "", { renderer }) as string,
);

function handleComponentClick(event: MouseEvent) {
	let target = event.target as HTMLElement;

	while (target && !target.getAttribute("data-component-id")) {
		if (!target.parentElement) return;

		target = target.parentElement;
	}

	$selectedComponent = target.getAttribute("data-component-id");
}

function handleResize(event: MouseEvent) {
	event.preventDefault();

	const target = event.target as HTMLElement;
	const resizer = target.getAttribute("data-resizer");

	if (!target.parentElement) return;

	const gridArea = getComputedStyle(target.parentElement).getPropertyValue(
		"grid-area",
	);
	const currentComponentIndex = $components.findIndex(
		(component) =>
			component.id === target.parentElement?.getAttribute("data-component-id"),
	);

	let [rowStart, colStart, rowEnd, colEnd] = gridArea.split(" / ").map(Number);

	switch (resizer) {
		case "right":
			updateDimensions(1, "col");
			break;
		case "left":
			updateDimensions(-1, "col");
			break;
		case "bottom":
			updateDimensions(1, "row");
			break;
		case "top":
			updateDimensions(-1, "row");
			break;
	}

	async function updateDimensions(delta: number, type: "row" | "col") {
		if (type === "col") {
			$components[currentComponentIndex].col_end_span = adjustSpan(
				colStart,
				colEnd,
				$components[currentComponentIndex].col_end_span,
				delta,
			);
			colEnd = adjustEnd(colStart, colEnd, delta);
		} else {
			$components[currentComponentIndex].row_end_span = adjustSpan(
				rowStart,
				rowEnd,
				$components[currentComponentIndex].row_end_span,
				delta,
			);
			rowEnd = adjustEnd(rowStart, rowEnd, delta);
		}

		const formData = new FormData();
		formData.append("component-id", `${$components[currentComponentIndex].id}`);
		formData.append("row-start", `${rowStart}`);
		formData.append("col-start", `${colStart}`);
		formData.append("row-end", `${rowEnd}`);
		formData.append("col-end", `${colEnd}`);
		formData.append(
			"row-end-span",
			`${$components[currentComponentIndex].row_end_span}`,
		);
		formData.append(
			"col-end-span",
			`${$components[currentComponentIndex].col_end_span}`,
		);

		const response = await fetch("?/updateComponentPosition", {
			method: "POST",
			body: formData,
		});

		const result = deserialize(await response.text());

		if (result.type === "success") {
			await invalidateAll();
		}

		applyAction(result);

		if (!target.parentElement) return;

		target.parentElement.style.gridArea = `${rowStart} / ${colStart} / ${rowEnd} / ${colEnd}`;
	}

	function adjustEnd(start: number, end: number, delta: number) {
		return start === end ? end + 2 * delta : end + delta;
	}

	function adjustSpan(
		start: number,
		end: number,
		span: number | undefined,
		delta: number,
	) {
		return start === end ? (span ?? 0) + delta * 2 : (span ?? 0) + delta;
	}
}
</script>

<div
    draggable="true"
    on:dragstart
    on:click={handleComponentClick}
    role="presentation"
    class="{className} relative"
    style={styles}
    data-component-id={component.id}
>
    <Resizer
        direction="right"
        className="bottom-1/2 -end-2 -translate-y-1/2 cursor-e-resize"
        on:mousedown={handleResize}
    />
    <Resizer
        direction="left"
        className="top-1/2 -end-2 translate-y-1/2 cursor-w-resize"
        on:mousedown={handleResize}
    />
    <Resizer
        direction="top"
        className="-bottom-2 end-1/2 -translate-x-1/2 cursor-n-resize"
        on:mousedown={handleResize}
    />
    <Resizer
        direction="bottom"
        className="-bottom-2 start-1/2 translate-x-1/2 cursor-s-resize"
        on:mousedown={handleResize}
    />

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
</div>
