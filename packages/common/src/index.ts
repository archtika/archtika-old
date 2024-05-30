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
  createElement(component: Component, localFileUrl?: string) {
    switch (component.type) {
      case "header":
        return this.createHeader();
      case "footer":
        return this.createFooter();
      case "section":
        return this.createSection();
      case "text":
        return this.createText(component.content.textContent ?? "");
      case "button":
        return this.createButton(
          component.content.textContent ?? "",
          component.content.hyperlink ?? "",
        );
      case "image":
        return this.createImage(
          localFileUrl ?? component.url ?? "",
          component.content.altText ?? "",
        );
      case "audio":
        return this.createAudio(
          localFileUrl ?? component.url ?? "",
          component.content.altText ?? "",
          component.content.isLooped ?? false,
        );
      case "video":
        return this.createVideo(
          localFileUrl ?? component.url ?? "",
          component.content.altText ?? "",
          component.content.isLooped ?? false,
        );
      default:
        throw new Error(`Unknown component type: ${component.type}`);
    }
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
    const renderer = new Renderer();

    renderer.html = (html) => {
      return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
    };

    let purifiedTextContent = "";

    purifiedTextContent = DOMPurify.sanitize(parse(textContent, { renderer }));

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
