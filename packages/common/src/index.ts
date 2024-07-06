import DOMPurify from "isomorphic-dompurify";
import { Renderer, parse } from "marked";

export const mimeTypes: { [key: string]: string[] } = {
  image: ["image/jpeg", "image/png", "image/svg+xml", "image/webp"],
  audio: ["audio/mpeg", "audio/wav", "audio/aac", "audio/ogg"],
  video: ["video/mp4", "video/webm", "video/ogg"],
};

export interface Component {
  id: string;
  type: string;
  page_id: string;
  content: {
    altText?: string;
    textContent?: string;
    isLooped?: boolean;
    hyperlink?: string;
  };
  asset_id?: string;
  parent_id: null | string;
  created_at: string | Date;
  updated_at: string | Date | null;
  url?: string | null;
  row_start: number;
  col_start: number;
  row_end: number;
  col_end: number;
  row_end_span: number;
  col_end_span: number;
  children?: Component[];
}

export function nestComponents(
  components: Component[],
  parentId: string | null = null,
): Component[] {
  const nested = components
    .filter((component) => component.parent_id === parentId)
    .map((component) => ({
      ...component,
      row_start: component.row_start,
      children: nestComponents(components, component.id),
    }));

  return nested;
}

export class ElementFactory {
  createElement(
    component: Component & Partial<{ children: Component[] }>,
    assetPaths: string[] = [],
  ) {
    let element = "";

    switch (component.type) {
      case "header":
        element = this.createHeader(component.id);
        break;
      case "footer":
        element = this.createFooter(component.id);
        break;
      case "section":
        element = this.createSection(component.id);
        break;
      case "text":
        element = this.createText(
          component.id,
          component.content.textContent ?? "",
        );
        break;
      case "button":
        element = this.createButton(
          component.id,
          component.content.textContent ?? "",
          component.content.hyperlink ?? "",
        );
        break;
      case "image":
        element = this.createImage(
          component.id,
          assetPaths.find((path) =>
            path.includes(component.asset_id as string),
          ) ??
            component.url ??
            "",
          component.content.altText ?? "",
        );
        break;
      case "audio":
        element = this.createAudio(
          component.id,
          assetPaths.find((path) =>
            path.includes(component.asset_id as string),
          ) ??
            component.url ??
            "",
          component.content.altText ?? "",
          component.content.isLooped ?? false,
        );
        break;
      case "video":
        element = this.createVideo(
          component.id,
          assetPaths.find((path) =>
            path.includes(component.asset_id as string),
          ) ??
            component.url ??
            "",
          component.content.altText ?? "",
          component.content.isLooped ?? false,
        );
        break;
      default:
        throw new Error(`Unknown component type: ${component.type}`);
    }

    if (component.children && component.children.length > 0) {
      const childrenElements = component.children
        .map((child) => this.createElement(child, assetPaths))
        .join("");
      element = element.replace("</", `${childrenElements}</`);
    }

    return element;
  }

  private createHeader(componentId: string) {
    return `<header class="header-${componentId}">
      <div class="container-${componentId}"></div>
    </header>`;
  }

  private createFooter(componentId: string) {
    return `<footer class="footer-${componentId}">
      <div class="container-${componentId}"></div>
    </footer>`;
  }

  private createSection(componentId: string) {
    return `<section class="section-${componentId}">
      <div class="container-${componentId}"></div>
    </section>`;
  }

  private createText(componentId: string, content: string) {
    const renderer = new Renderer();

    renderer.html = (html) => {
      return DOMPurify.sanitize(html as unknown as string, {
        ALLOWED_TAGS: [],
      });
    };

    let purifiedTextContent = "";

    purifiedTextContent = DOMPurify.sanitize(
      parse(content, { renderer }) as string,
    );

    return `<div class="text-${componentId}">
      ${purifiedTextContent}
    </div>`;
  }

  private createButton(
    componentId: string,
    textContent: string,
    hyperlink: string,
  ) {
    const purifiedTextContent = DOMPurify.sanitize(textContent);

    return `<a href="${hyperlink}" class="button-${componentId}">${purifiedTextContent}</a>`;
  }

  private createImage(componentId: string, src: string, alt: string) {
    const draggable = src.includes("X-Amz-Algorithm");

    return `<img src="${src}" ${
      draggable ? 'draggable="false"' : ""
    } alt="${alt}" class="image-${componentId}" />`;
  }

  private createAudio(
    componentId: string,
    src: string,
    alt: string,
    loop: boolean,
  ) {
    const loopAttr = loop ? "loop" : "";
    return `
      <audio controls title="${alt}" ${loopAttr} class="audio-${componentId}">
        <source src="${src}" />
      </audio>
    `;
  }

  private createVideo(
    componentId: string,
    src: string,
    alt: string,
    loop: boolean,
  ) {
    const loopAttr = loop ? "loop" : "";
    return `
      <video controls src="${src}" title="${alt}" ${loopAttr} class="video-${componentId}">
        <track default kind="captions" srclang="en" />
      </video>
    `;
  }
}
