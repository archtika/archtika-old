<script lang="ts">
  import { browser } from "$app/environment";
  import { applyAction, deserialize, enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import { page } from "$app/stores";
  import RenderComponent from "$lib/components/RenderComponent.svelte";
  import { components, selectedComponent } from "$lib/stores";
  import type { Component } from "common";
  import { mimeTypes } from "common";
  import { nestComponents } from "common";
  import type { PageServerData } from "./$types";
  import type { SubmitFunction } from "./$types";

  export let data: PageServerData;

  $: $components = data.components;

  function getMimeTypes(type: string): string[] {
    return mimeTypes[type as "image" | "audio" | "video"];
  }

  $: getMedia = (
    type: string,
    updatedComponent: undefined | Component = undefined
  ) => {
    if (!data.media[type]) return [];

    if (updatedComponent) {
      return data.media[type].filter(
        (media: { id: string }) => media.id !== updatedComponent.asset_id
      );
    }

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

  let ws: WebSocket;

  if (browser) {
    ws = new WebSocket(
      `ws://localhost:3000/api/v1/pages/${$page.params.pageId}/components`
    );

    ws.onopen = () => {
      console.log("Websocket connected");
    };

    ws.onmessage = ({ data }) => {
      const { operation_type, data: newComponent } = JSON.parse(data);

      console.log("Websocket event triggered!");
      console.log(operation_type, newComponent)
      console.log([...$components, newComponent])

      switch (operation_type) {
        case "create":
          $components = [...$components, newComponent];
          break;
        case "update":
        case "update-position":
          $components = $components.map((component) =>
            component.id === newComponent.id
              ? { ...component, ...newComponent }
              : component
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

  $: totalRows = Math.max(0, ...$components.map((item) => item.row_end)) + 12;
</script>

<svelte:window
  on:keydown={(e) => e.key === "Escape" && ($selectedComponent = null)}
  on:click={handleWindowClick}
/>

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
            <a href="/websites/{$page.params.websiteId}/pages/{id}">{title}</a>
          </li>
        {/each}
      </ul>
    </details>

    <h2>{data.page.title}</h2>

    {#if $selectedComponent}
      {@const componentData = $components.find(
        (component) => component.id === $selectedComponent
      )}

      <p>Selected component:</p>
      <ul>
        <li>
          Type: <strong>{componentData?.type}</strong>
        </li>
        <li>
          Unique id: <code>{componentData?.id}</code>
        </li>
      </ul>

      {#if componentData?.type === "text"}
        <form
          action="?/updateComponent"
          method="post"
          use:enhance={() => {
            return async ({ update }) => {
              await update({ reset: false });
            };
          }}
        >
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
              name="updated-content"
              required>{componentData?.content.textContent}</textarea
            >
          </label>
          <button type="submit">Update</button>
        </form>
      {/if}

      {#if componentData?.type === "button"}
        <form
          action="?/updateComponent"
          method="post"
          use:enhance={() => {
            return async ({ update }) => {
              await update({ reset: false });
            };
          }}
        >
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
            Text:
            <input
              type="text"
              id="update-component-{$selectedComponent}-content"
              name="updated-text-content"
              value={componentData.content.textContent}
              required
            />
          </label>
          <label>
            Link:
            <input
              type="text"
              id="update-component-${selectedComponent}-hyperlink"
              name="updated-hyperlink"
              value={componentData.content.hyperlink}
              required
            />
          </label>
          <button type="submit">Update</button>
        </form>
      {/if}

      {#if ["image", "video", "audio"].includes(componentData?.type ?? "")}
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
              (componentData?.type.slice(1) ?? "")}:
            <input
              id="update-component-{componentData?.id}-file"
              name="file"
              type="file"
              accept={getMimeTypes(componentData?.type ?? "image").join(", ")}
            />
          </label>
          {#if getMedia(componentData?.type ?? "", componentData).length > 0}
            <fieldset>
              <legend>Select existing {componentData?.type}:</legend>
              <div>
                {#each getMedia(componentData?.type ?? "", componentData) as media}
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
          {/if}
          <label>
            Alt text:
            <input
              id="update-component-{componentData?.id}-alt-text"
              name="alt-text"
              type="text"
              minlength="1"
            />
          </label>
          {#if ["audio", "video"].includes(componentData?.type ?? "")}
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

      <form
        action="?/deleteComponent"
        method="post"
        use:enhance={() => {
          return async ({ update }) => {
            await update();
            $selectedComponent = null;
          };
        }}
      >
        <input
          type="hidden"
          id="delete-component-{$selectedComponent}"
          name="id"
          value={$selectedComponent}
        />
        <button type="submit">Delete</button>
      </form>

      {#if componentData?.type && ["header", "section", "footer"].includes(componentData.type)}
        <h3>Components</h3>

        <details>
          <summary>Text</summary>
          <form
            action="?/createComponent"
            method="post"
            use:enhance
          >
            <input
              type="hidden"
              id="create-component-text-type"
              name="type"
              value="text"
            />
            <input
              type="hidden"
              id="create-component-text-parent-id"
              name="parent-id"
              value={componentData?.id}
            />
            <label>
              Content:
              <textarea
                id="create-component-text-content"
                name="content"
                required
              ></textarea>
            </label>
            <button type="submit">Add</button>
          </form>
        </details>
        <details>
          <summary>Button</summary>
          <form
            action="?/createComponent"
            method="post"
            use:enhance
          >
            <input
              type="hidden"
              id="create-component-button-type"
              name="type"
              value="button"
            />
            <input
              type="hidden"
              id="create-component-button-parent-id"
              name="parent-id"
              value={componentData?.id}
            />
            <label>
              Text:
              <input
                type="text"
                id="create-component-button-content"
                name="text-content"
                required
              />
            </label>
            <label>
              Link:
              <input
                type="text"
                id="create-component-button-hyperlink"
                name="hyperlink"
                required
              />
            </label>
            <button type="submit">Add</button>
          </form>
        </details>
        {#each Object.entries(mimeTypes) as [type, mimes]}
          {@const title = type.charAt(0).toUpperCase() + type.slice(1)}

          <details>
            <summary>{title}</summary>
            <form
              action="?/createComponent"
              method="post"
              use:enhance
              enctype="multipart/form-data"
            >
              <input
                type="hidden"
                id="create-component-{type}-type"
                name="type"
                value={type}
              />
              <input
                type="hidden"
                id="create-component-{type}-parent-id"
                name="parent-id"
                value={componentData?.id}
              />
              <label>
                {title}:
                <input
                  id="create-component-{type}-file"
                  name="file"
                  type="file"
                  accept={mimes.join(", ")}
                />
              </label>
              {#if getMedia(type).length > 0}
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
              {/if}
              <label>
                Alt text:
                <input
                  id="create-component-{type}-alt-text"
                  name="alt-text"
                  type="text"
                  minlength="1"
                />
              </label>
              {#if ["audio", "video"].includes(type)}
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
          </details>
        {/each}
      {/if}
    {:else}
      <details>
        <summary>Update page</summary>
        <form
          method="post"
          action="?/updatePage"
          use:enhance={() => {
            return async ({ update }) => {
              await update({ reset: false });
            };
          }}
        >
          <label>
            Route:
            <input
              id="update-page-route"
              name="route"
              type="text"
              value={data.page.route}
              minlength="1"
              maxlength="200"
              pattern={"^/(|[a-z0-9]+(?:-[a-z0-9]+)*(?:/[a-z0-9]+(?:-[a-z0-9]+)*)*)$"}
              required
            />
          </label>
          <label>
            Title:
            <input
              id="update-page-title"
              name="title"
              type="text"
              value={data.page.title}
              minlength="5"
              maxlength="50"
              required
            />
          </label>
          <label>
            Description:
            <textarea
              id="update-page-description"
              name="description"
              minlength="10"
              maxlength="200">{data.page.meta_description}</textarea
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

      <h3>Structure</h3>

      <form
        action="?/createComponent"
        method="post"
        use:enhance
      >
        <input
          type="hidden"
          id="create-component-header-type"
          name="type"
          value="header"
        />
        <button type="submit">Header</button>
      </form>
      <form
        action="?/createComponent"
        method="post"
        use:enhance
      >
        <input
          type="hidden"
          id="create-component-footer-type"
          name="type"
          value="footer"
        />
        <button type="submit">Footer</button>
      </form>
      <form
        action="?/createComponent"
        method="post"
        use:enhance
      >
        <input
          type="hidden"
          id="create-component-section-type"
          name="type"
          value="section"
        />
        <button type="submit">Section</button>
      </form>
    {/if}
  </div>

  <div
    style="grid-template-rows: repeat({totalRows}, 2.5rem"
    data-content-container
  >
    {#each Array(totalRows) as _, i}
      <div style="grid-area: {i + 1} / 1 / {i + 1} / 13" data-row={i + 1} />
    {/each}
    {#each nestComponents($components) as component, i (i)}
      <RenderComponent {component} />
    {/each}
  </div>
</div>

<style>
  .editor-wrapper {
    display: grid;
    grid-template-columns: 30ch minmax(min(50vw, 30ch), 1fr);
  }

  div[data-sidebar],
  div[data-content-container] {
    max-block-size: 100vh;
    overflow-y: auto;
    border: 0.125rem solid black;
  }

  div[data-content-container] {
    padding-inline: 1rem;
    padding-block: 2rem;
  }

  div[data-sidebar] {
    padding-inline: 0.5rem;
  }

  div[data-content-container] {
    display: grid;
  }
</style>
