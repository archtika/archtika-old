export const mimeTypes: { [key: string]: string[] } = {
  image: ["image/jpeg", "image/png", "image/svg+xml", "image/webp"],
  audio: ["audio/mpeg", "audio/wav", "audio/aac", "audio/ogg"],
  video: ["video/mp4", "video/webm", "video/ogg"],
};

export class ElementFactory {
  createElement(component, purifiedTextContent: string) {
    switch (component.type) {
      case "header":
        return this.createHeader();
      case "footer":
        return this.createFooter();
      case "text":
        return this.createText(purifiedTextContent);
      case "image":
        return this.createImage(component.url, component.content.altText);
      case "audio":
        return this.createAudio(
          component.url,
          component.content.altText,
          component.content.isLooped,
        );
      case "video":
        return this.createVideo(
          component.url,
          component.content.altText,
          component.content.isLooped,
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
