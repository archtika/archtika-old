<script lang="ts">
import { browser } from "$app/environment";
import { applyAction, deserialize, enhance } from "$app/forms";
import { invalidateAll } from "$app/navigation";
import { page } from "$app/stores";
import RenderComponent from "$lib/components/RenderComponent.svelte";
import { components, selectedComponent } from "$lib/stores";
import type { Component } from "$lib/types";
import { mimeTypes } from "common";
import type { PageServerData } from "./$types";
import type { SubmitFunction } from "./$types";

export let data: PageServerData;

$: $components = data.components;

function getMimeTypes(type: string): string[] {
	return mimeTypes[type as "image" | "audio" | "video"];
}

$: getMedia = (type: string) => {
	if (!data.media[type]) return [];

	return data.media[type];
};

function handleWindowClick(event: MouseEvent) {
	const target = event.target as HTMLElement;

	if (
		!target.closest("[data-component-id]") &&
		!target.closest("[data-sidebar]")
	) {
		$selectedComponent = null;
	}
}

function handleDragStart(event: DragEvent) {
	const componentId = (event.target as HTMLElement).getAttribute(
		"data-component-id",
	);

	if (componentId) {
		event.dataTransfer?.setData("text/plain", componentId);
	}
}

function handleDragOver(event: DragEvent) {
	event.preventDefault();
}

function handleDragEnter(event: DragEvent) {
	const target = event.target as HTMLElement;

	target.style.backgroundColor = "red";
}

function handleDragLeave(event: DragEvent) {
	const target = event.target as HTMLElement;

	target.style.backgroundColor = "";
}

let currentComponentDropArea: HTMLElement | null;

function handleComponentDragEnter(event: DragEvent) {
	const target = event.target as HTMLElement;

	if (
		!["header", "footer"].includes(
			target.getAttribute("data-component-type") ?? "",
		)
	) {
		return;
	}

	currentComponentDropArea = target;
	target.style.zIndex = "-10";
}

function isOutsideNestedComponent(target: HTMLElement) {
	if (!currentComponentDropArea) {
		return;
	}

	for (const element of [
		...document.querySelectorAll(
			'[data-component-type="footer"], [data-component-type="header"]',
		),
	] as HTMLElement[]) {
		element.style.zIndex = "";
	}

	let rowStart = 0;
	let colStart = 0;
	let rowEnd = 0;
	let colEnd = 0;

	const gridArea = getComputedStyle(currentComponentDropArea).getPropertyValue(
		"grid-area",
	);
	[rowStart, colStart, rowEnd, colEnd] = gridArea.split(" / ").map(Number);

	const totalZones = Math.abs((rowEnd - rowStart) * (colEnd - colStart));
	let zoneStart = 0;
	let zoneEnd = 0;

	if (rowStart < 0) {
		const numZones = Array.from(document.querySelectorAll("div[data-zone]"))
			.pop()
			?.getAttribute("data-zone");

		zoneStart =
			Number.parseInt(numZones as string) -
			Math.abs((rowEnd - rowStart) * 12) +
			1;
		zoneEnd = zoneStart + totalZones - 1;
	} else {
		zoneStart = (rowStart === 1 ? 0 : rowStart) * 12 + colStart;
		zoneEnd = zoneStart + totalZones - 1;
	}

	const zone = Number.parseInt(target.getAttribute("data-zone") as string);

	if (zone > zoneEnd || zone < zoneStart) {
		currentComponentDropArea = null;
	}
}

async function handleDrop(
	event: DragEvent,
	rowStart: number,
	colStart: number,
	rowEnd: number,
	colEnd: number,
) {
	event.preventDefault();

	const target = event.target as HTMLElement;

	target.style.backgroundColor = "";

	isOutsideNestedComponent(target);

	const isFooterDropArea =
		currentComponentDropArea?.getAttribute("data-component-type") === "footer";

	let totalNumRows = 0;

	if (isFooterDropArea) {
		const numZones = Array.from(document.querySelectorAll("div[data-zone]"))
			.pop()
			?.getAttribute("data-zone");

		if (typeof numZones === "string") {
			totalNumRows = Number.parseInt(numZones) / 12;
		}
	}

	const componentId = event.dataTransfer?.getData("text/plain");

	const index = $components.findIndex((component: Component) => {
		return component.id === componentId;
	});

	$components[index] = {
		...$components[index],
		row_start: isFooterDropArea ? rowStart - totalNumRows - 1 : rowStart,
		col_start: colStart,
		row_end: isFooterDropArea
			? rowEnd - totalNumRows - 1 - ($components[index].row_end_span || 1)
			: rowEnd + ($components[index].row_end_span ?? 0),
		col_end: colEnd + ($components[index].col_end_span ?? 0),
	};

	const updateComponentFormData = new FormData();
	updateComponentFormData.append("id", `${$components[index].id}`);
	updateComponentFormData.append("type", `${$components[index].type}`);
	updateComponentFormData.append(
		"parent-id",
		currentComponentDropArea?.getAttribute("data-component-id") ?? "",
	);

	const updateComponentResponse = await fetch("?/updateComponent", {
		method: "POST",
		body: updateComponentFormData,
	});

	const updateComponentResult = deserialize(
		await updateComponentResponse.text(),
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

const enhanceCreateComponentForm: SubmitFunction = ({ formData }) => {
	const gridCellSize = document.querySelector(`[data-zone="1"]`);

	if (!gridCellSize) return;

	const rect = gridCellSize.getBoundingClientRect();
	const gridCellHeight = rect.height;
	const contentContainer = document.querySelector("[data-content-container]");

	if (!contentContainer) return;

	const scrollTop = contentContainer.scrollTop;
	const partialOffset = scrollTop % gridCellHeight;
	const visibleZoneIndex = Math.floor(scrollTop / gridCellHeight);
	const zone = visibleZoneIndex * 12 + 1;
	const zoneElement = document.querySelector(`[data-zone="${zone}"]`);

	if (!zoneElement) return;

	const gridArea = getComputedStyle(zoneElement).getPropertyValue("grid-area");
	let [rowStart, colStart, rowEnd, colEnd] = gridArea.split(" / ").map(Number);

	if (partialOffset > gridCellHeight * 0.5) {
		rowStart += 1;
		rowEnd += 1;
	}

	if (formData.get("type") === "footer") {
		rowStart = -1;
		rowEnd = -2;
	}

	const initialPosition = JSON.stringify({
		rowStart,
		colStart,
		rowEnd,
		colEnd,
	});

	formData.append("initial-position", initialPosition);
};

let ws: WebSocket;

if (browser) {
	ws = new WebSocket(
		`ws://localhost:3000/api/v1/pages/${$page.params.pageId}/components`,
	);

	ws.onopen = () => {
		console.log("Websocket connected");
	};

	ws.onmessage = ({ data }) => {
		const { operation_type, data: newComponent } = JSON.parse(data);

		console.log("Websocket event triggered!");

		switch (operation_type) {
			case "create":
				$components = [...$components, newComponent];
				break;
			case "update":
			case "update-position":
				$components = $components.map((component) =>
					component.id === newComponent.id
						? { ...component, ...newComponent }
						: component,
				);
				break;
			case "delete":
				$components = $components.filter((component) => {
					return component.id !== newComponent.id;
				});
				break;
		}
	};

	ws.onerror = (error) => {
		console.error("WebSocket error: ", error);
	};

	ws.onclose = () => {
		console.log("Websocket connection closed");
	};
}

$: totalRows =
	Math.max(12, ...$components.map((item) => item.row_end)) + 12 || 24;
</script>

<svelte:window on:click={handleWindowClick} />

<div class="editor-wrapper">
    <div data-sidebar>
        <h1>
            <a href="/websites/{data.website.id}">{data.website.title}</a>
        </h1>
        <details>
            <summary>Pages</summary>
            <ul>
                {#each data.pages as { id, title }}
                    <li>
                        <a href={id}>{title}</a>
                    </li>
                {/each}
            </ul>
        </details>

        <h2>{data.page.title}</h2>

        {#if $selectedComponent}
            {@const componentData = $components.find(component => component.id === $selectedComponent)}

            <p>Selected component:</p>
            <ul>
                <li>
                    Type: <strong>{componentData?.type}</strong>
                </li>
                <li>
                    Unique id: <code>{componentData?.id}</code>
                </li>
            </ul>

            {#if componentData?.type === 'text'}
                <form action="?/updateComponent" method="post" use:enhance={() => {
                    return async ({ update }) => {
                        await update({ reset: false })
                    }
                }}>
                    <input
                        type="hidden"
                        id="update-component-{componentData?.id}-id"
                        name="id"
                        value={componentData?.id}
                    />
                    <input
                        type="hidden"
                        id="update-component-{componentData?.type}-type"
                        name="type"
                        value={componentData?.type}
                    />
                    <label>
                        Content:
                        <textarea
                            id="update-component-{$selectedComponent}-content"
                            name="updated-content">{componentData?.content.textContent}</textarea>
                    </label>
                    <button type="submit">Update</button>
                </form>
            {/if}

            {#if ['image', 'video', 'audio'].includes(componentData?.type ?? '')}
                <form
                    action="?/updateComponent"
                    method="post"
                    use:enhance
                    enctype="multipart/form-data"
                >
                    <input
                        type="hidden"
                        id="update-component-{componentData?.id}-type"
                        name="type"
                        value={componentData?.type}
                    />
                    <input
                        type="hidden"
                        id="update-component-{componentData?.id}-id"
                        name="id"
                        value={componentData?.id}
                    />

                    <label>
                        {componentData?.type.charAt(0).toUpperCase() +
                            (componentData?.type.slice(1) ?? '')}:
                        <input
                            id="update-component-{componentData?.id}-file"
                            name="file"
                            type="file"
                            accept={getMimeTypes(componentData?.type ?? 'image').join(', ')}
                        />
                    </label>
                    <fieldset>
                        <legend>Select existing {componentData?.type}:</legend>
                        <div>
                            {#each getMedia(componentData?.type ?? '') as media}
                                <label>
                                    <input
                                        type="radio"
                                        id="update-component-{componentData?.id}-existing-file-{media.id}"
                                        name="existing-file"
                                        value={media.id}
                                    />
                                    {media.name}
                                </label>
                            {/each}
                        </div>
                    </fieldset>
                    <label>
                        Alt text:
                        <input
                            id="update-component-{componentData?.id}-alt-text"
                            name="alt-text"
                            type="text"
                        />
                    </label>
                    {#if ['audio', 'video'].includes(componentData?.type ?? '')}
                        <label>
                            Loop:
                            <input
                                id="update-component-{componentData?.id}-is-looped"
                                name="is-looped"
                                type="checkbox"
                            />
                        </label>
                    {/if}
                    <button type="submit">Save</button>
                </form>
            {/if}

            <form action="?/deleteComponent" method="post" use:enhance={() => {
                return async ({ update }) => {
                    await update()
                    $selectedComponent = null
                }
            }}>
                <input
                    type="hidden"
                    id="delete-component-{$selectedComponent}"
                    name="id"
                    value={$selectedComponent}
                />
                <button type="submit">Delete</button>
            </form>
        {:else}
            <details>
                <summary>Update page</summary>
                <form
                    method="post"
                    action="?/updatePage"
                    use:enhance={() => {
                        return async ({ update }) => {
                            await update({ reset: false })
                        }
                    }}
                >
                    <label>
                        Route:
                        <input
                            id="update-page-route"
                            name="route"
                            type="text"
                            value={data.page.route}
                        />
                    </label>
                    <label>
                        Title:
                        <input
                            id="update-page-title"
                            name="title"
                            type="text"
                            value={data.page.title}
                        />
                    </label>
                    <label>
                        Description:
                        <textarea id="update-page-description" name="description"
                            >{data.page.meta_description}</textarea
                        >
                    </label>
                    <button type="submit">Update</button>
                </form>
            </details>
            <details>
                <summary>Delete</summary>
                <form method="post" action="?/deletePage" use:enhance>
                    <button type="submit">Delete page</button>
                </form>
            </details>

            <h3>Components</h3>

            <form action="?/createComponent" method="post" use:enhance={enhanceCreateComponentForm}>
                <input
                    type="hidden"
                    id="create-component-header-type"
                    name="type"
                    value="header"
                />
                <button type="submit">Add header</button>
            </form>
            <form action="?/createComponent" method="post" use:enhance={enhanceCreateComponentForm}>
                <input
                    type="hidden"
                    id="create-component-footer-type"
                    name="type"
                    value="footer"
                />
                <button type="submit">Add footer</button>
            </form>

            <div>
                <h4>Text</h4>
                <form action="?/createComponent" method="post" use:enhance={enhanceCreateComponentForm}>
                    <input
                        type="hidden"
                        id="create-component-text-type"
                        name="type"
                        value="text"
                    />
                    <label>
                        Content:
                        <textarea
                            id="create-component-text-content"
                            name="content"
                        ></textarea>
                    </label>
                    <button type="submit">Add</button>
                </form>
            </div>
            {#each Object.entries(mimeTypes) as [type, mimes]}
                {@const title = type.charAt(0).toUpperCase() + type.slice(1)}

                <div>
                    <h4>{title}</h4>
                    <form
                        action="?/createComponent"
                        method="post"
                        use:enhance={enhanceCreateComponentForm}
                        enctype="multipart/form-data"
                    >
                        <input
                            type="hidden"
                            id="create-component-{type}-type"
                            name="type"
                            value={type}
                        />
                        <label>
                            {title}:
                            <input
                                id="create-component-{type}-file"
                                name="file"
                                type="file"
                                accept={mimes.join(', ')}
                            />
                        </label>
                        <fieldset>
                            <legend>Select existing {type}:</legend>
                            <div>
                                {#each getMedia(type) as media}
                                    <label>
                                        <input
                                            id="create-component-{type}-existing-file-{media.id}"
                                            type="radio"
                                            name="existing-file"
                                            value={media.id}
                                        />
                                        {media.name}
                                    </label>
                                {/each}
                            </div>
                        </fieldset>
                        <label>
                            Alt text:
                            <input
                                id="create-component-{type}-alt-text"
                                name="alt-text"
                                type="text"
                            />
                        </label>
                        {#if ['audio', 'video'].includes(type)}
                            <label>
                                Loop:
                                <input
                                    id="create-component-{type}-is-looped"
                                    name="is-looped"
                                    type="checkbox"
                                />
                            </label>
                        {/if}
                        <button type="submit">Add</button>
                    </form>
                </div>
            {/each}
        {/if}
    </div>

    <div
        style="grid-template-rows: repeat({totalRows}, 2.5rem"
        data-content-container
    >
        {#each Array(totalRows * 12) as _, i}
            {@const row = Math.floor(i / 12) + 1}
            {@const col = (i % 12) + 1}

            <div
                style="grid-area: {row} / {col} / {row} / {col}"
                data-zone={i + 1}
                on:dragover={handleDragOver}
                on:dragenter={handleDragEnter}
                on:dragleave={handleDragLeave}
                on:drop={(event) => handleDrop(event, row, col, row, col)}
                on:drag
                role="presentation"
            />
        {/each}
        {#each $components as component, i (i)}
            <RenderComponent
                {component}
                styles="grid-area: {component.row_start ??
                    1} / {component.col_start ?? 1} / {component.row_end ??
                    1} / {component.col_end ?? 1}{!["header", "footer"].includes(component.type) ? "; z-index: 10" : ""}"
                on:dragstart={handleDragStart}
                on:dragenter={handleComponentDragEnter}
            />
        {/each}
    </div>
</div>

<style>
    .editor-wrapper {
        display: grid;
        grid-template-columns: 30ch minmax(min(50vw, 30ch), 1fr);
    }

    div[data-sidebar], div[data-content-container] {
        max-block-size: 100vh;
        overflow-y: auto;
        border: 0.125rem solid black;
    }

    div[data-sidebar] {
        padding-inline: 0.5rem;
    }

    div[data-content-container] {
        display: grid;
        grid-template-columns: repeat(12, minmax(0, 1fr));
    }
</style>