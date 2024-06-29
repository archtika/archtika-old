import type { ComponentApiPayload } from "$lib/types";
import { error, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({
  fetch,
  params,
  parent,
  locals,
}) => {
  const pageData = await fetch(
    `http://localhost:3000/api/v1/websites/${params.websiteId}/pages/${params.pageId}`,
  );

  if (!pageData.ok) {
    throw error(404, "Page not found");
  }

  const pagesData = await fetch(
    `http://localhost:3000/api/v1/websites/${params.websiteId}/pages`,
  );
  const componentsData = await fetch(
    `http://localhost:3000/api/v1/pages/${params.pageId}/components`,
  );
  const mediaData = await fetch("http://localhost:3000/api/v1/media");

  const { website } = await parent();
  const page = await pageData.json();
  const pages = await pagesData.json();
  const components = await componentsData.json();
  const media = await mediaData.json();

  return {
    website,
    page,
    pages,
    components,
    media,
    account: locals.account,
  };
};

export const actions: Actions = {
  updatePage: async ({ request, fetch, params }) => {
    const data = await request.formData();

    await fetch(
      `http://localhost:3000/api/v1/websites/${params.websiteId}/pages/${params.pageId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          route: data.get("route"),
          title: data.get("title"),
          metaDescription: data.get("description"),
        }),
      },
    );
  },
  deletePage: async ({ fetch, params }) => {
    const deletionRequest = await fetch(
      `http://localhost:3000/api/v1/websites/${params.websiteId}/pages/${params.pageId}`,
      {
        method: "DELETE",
      },
    );

    if (!deletionRequest.ok) {
      throw error(403, "Not allowed");
    }

    throw redirect(303, `/websites/${params.websiteId}`);
  },
  createComponent: async ({ request, fetch, params }) => {
    const data = await request.formData();

    let body: ComponentApiPayload = {
      type: "",
      content: {},
    };

    switch (data.get("type")) {
      case "header":
      case "footer":
        {
          body = {
            type: data.get("type") as string,
            is_public: true,
            content: null,
            parent_id: null,
          };
        }
        break;
      case "section":
        {
          body = {
            type: data.get("type") as string,
            content: null,
            parent_id: null,
          };
        }
        break;
      case "text":
        body = {
          type: data.get("type") as string,
          content: {
            textContent: data.get("content") as string,
          },
          parent_id: data.get("parent-id") as string,
        };
        break;
      case "button":
        body = {
          type: data.get("type") as string,
          content: {
            textContent: data.get("text-content") as string,
            hyperlink: data.get("hyperlink") as string,
          },
          parent_id: data.get("parent-id") as string,
        };
        break;
      case "image":
      case "audio":
      case "video":
        {
          const formData = new FormData();
          formData.append("file", data.get("file") as File);

          const existingFile = data.get("existing-file");
          let assetId: string | undefined;

          if (typeof existingFile === "string") {
            assetId = existingFile;
          } else {
            const imageData = await fetch(
              "http://localhost:3000/api/v1/media",
              {
                method: "POST",
                body: formData,
              },
            );

            const image = await imageData.json();
            assetId = image.id;
          }

          body = {
            type: data.get("type") as string,
            content: {
              altText: data.get("alt-text") as string,
            },
            assetId,
            parent_id: data.get("parent-id") as string,
          };

          if (["audio", "video"].includes(data.get("type") as string)) {
            if (!body.content) return;

            body.content.isLooped = Boolean(data.get("is-looped"));
          }
        }
        break;
    }

    await fetch(
      `http://localhost:3000/api/v1/pages/${params.pageId}/components`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
  },
  updateComponent: async ({ request, fetch, params }) => {
    const data = await request.formData();

    let body: ComponentApiPayload = {
      type: "",
    };

    switch (data.get("type")) {
      case "text":
        body = {
          type: data.get("type") as string,
          content: {
            textContent: data.get("updated-content") as string,
          },
        };
        break;
      case "button":
        body = {
          type: data.get("type") as string,
          content: {
            textContent: data.get("updated-text-content") as string,
            hyperlink: data.get("updated-hyperlink") as string,
          },
        };
        break;
      case "image":
      case "audio":
      case "video":
        {
          const formData = new FormData();
          formData.append("file", data.get("file") as File);

          const existingFile = data.get("existing-file");
          let assetId: string | undefined;

          if (typeof existingFile === "string") {
            assetId = existingFile;
          } else {
            const imageData = await fetch(
              "http://localhost:3000/api/v1/media",
              {
                method: "POST",
                body: formData,
              },
            );

            const image = await imageData.json();
            assetId = image.id;
          }

          body = {
            type: data.get("type") as string,
            content: {
              altText: data.get("alt-text") as string,
            },
            assetId,
          };

          if (["audio", "video"].includes(data.get("type") as string)) {
            if (!body.content) return;

            body.content.isLooped = Boolean(data.get("is-looped"));
          }
        }
        break;
    }

    body.parent_id = (data.get("parent-id") as string) ?? undefined;

    if (data.get("submission-type") === "drop-event") {
      body.content = undefined;
    }

    await fetch(
      `http://localhost:3000/api/v1/pages/${
        params.pageId
      }/components/${data.get("id")}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
  },
  deleteComponent: async ({ request, fetch, params }) => {
    const data = await request.formData();

    await fetch(
      `http://localhost:3000/api/v1/pages/${
        params.pageId
      }/components/${data.get("id")}`,
      {
        method: "DELETE",
      },
    );
  },
  updateComponentPosition: async ({ request, fetch }) => {
    const data = await request.formData();

    await fetch(
      `http://localhost:3000/api/v1/components/${data.get(
        "component-id",
      )}/position`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          row_start: data.get("row-start"),
          col_start: data.get("col-start"),
          row_end: data.get("row-end"),
          col_end: data.get("col-end"),
          row_end_span: data.get("row-end-span"),
          col_end_span: data.get("col-end-span"),
        }),
      },
    );
  },
};
