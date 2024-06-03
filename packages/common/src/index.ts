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
}

export class ElementFactory {
  createElement(
    component: Component & Partial<{ children: Component[] }>,
    localFileUrl?: string,
  ) {
    let element = ""

    switch (component.type) {
      case "header":
        element = this.createHeader();
        break;
      case "footer":
        element = this.createFooter();
        break;
      case "section":
        element = this.createSection();
        break;
      case "text":
        element = this.createText(component.content.textContent ?? "");
        break;
      case "button":
        element = this.createButton(
          component.content.textContent ?? "",
          component.content.hyperlink ?? "",
        );
        break;
      case "image":
        element = this.createImage(
          localFileUrl ?? component.url ?? "",
          component.content.altText ?? "",
        );
        break;
      case "audio":
        element = this.createAudio(
          localFileUrl ?? component.url ?? "",
          component.content.altText ?? "",
          component.content.isLooped ?? false,
        );
        break;
      case "video":
        element = this.createVideo(
          localFileUrl ?? component.url ?? "",
          component.content.altText ?? "",
          component.content.isLooped ?? false,
        );
        break;
      default:
        throw new Error(`Unknown component type: ${component.type}`);
    }

    if (component.children && component.children.length > 0) {
      const childrenElements = component.children.map(child => this.createElement(child, localFileUrl)).join('');
      element = element.replace('</', `${childrenElements}</`);
    }

    return element;
  }

  private createHeader() {
    return "<header></header>";
  }

  private createFooter() {
    return "<footer></footer>";
  }

  private createSection() {
    return "<section></section>";
  }

  private createText(content: string) {
    const renderer = new Renderer();

    renderer.html = (html) => {
      return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
    };

    let purifiedTextContent = "";

    purifiedTextContent = DOMPurify.sanitize(parse(content, { renderer }));

    return `<div>${purifiedTextContent}</div>`;
  }

  private createButton(textContent: string, hyperlink: string) {
    const purifiedTextContent = DOMPurify.sanitize(textContent);

    return `<a href="${hyperlink}">${purifiedTextContent}</a>`;
  }

  private createImage(src: string, alt: string) {
    return `<img src="${src}" alt="${alt}" />`;
  }

  private createAudio(src: string, alt: string, loop: boolean) {
    const loopAttr = loop ? " loop" : "";
    return `
      <audio controls title="${alt}"${loopAttr}>
        <source src="${src}" />
      </audio>
    `;
  }

  private createVideo(src: string, alt: string, loop: boolean) {
    const loopAttr = loop ? " loop" : "";
    return `
      <video controls src="${src}" title="${alt}"${loopAttr}>
        <track default kind="captions" srclang="en" />
      </video>
    `;
  }
}
