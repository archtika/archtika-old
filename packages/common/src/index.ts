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
  };
  asset_id?: string;
  parent_id: null | string;
  created_at: string;
  updated_at: string | null;
  url: string | null;
  row_start: number;
  col_start: number;
  row_end: number;
  col_end: number;
  row_end_span: number;
  col_end_span: number;
}

export class ElementFactory {
  createElement(component: Component, purifiedTextContent: string) {
    switch (component.type) {
      case "header":
        return this.createHeader();
      case "footer":
        return this.createFooter();
      case "text":
        return this.createText(purifiedTextContent);
      case "image":
        return this.createImage(
          component.url ?? "",
          component.content.altText ?? "",
        );
      case "audio":
        return this.createAudio(
          component.url ?? "",
          component.content.altText ?? "",
          component.content.isLooped ?? false,
        );
      case "video":
        return this.createVideo(
          component.url ?? "",
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

  private createText(content: string) {
    return content;
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
