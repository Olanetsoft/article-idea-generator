/**
 * Configuration for all tools in the /tools section
 */

import type { Tool, ToolIcon } from "@/types";

export type { Tool, ToolIcon };

export const tools: Tool[] = [
  {
    id: "cover-image-generator",
    nameKey: "tools.coverImage.name",
    descriptionKey: "tools.coverImage.description",
    href: "/tools/cover-image-generator",
    icon: "photograph",
    available: true,
  },
  {
    id: "qr-code-generator",
    nameKey: "tools.qrCode.name",
    descriptionKey: "tools.qrCode.description",
    href: "/tools/qr-code-generator",
    icon: "qrcode",
    available: true,
  },
  {
    id: "pdf-signer",
    nameKey: "tools.pdfSigner.name",
    descriptionKey: "tools.pdfSigner.description",
    href: "/tools/pdf-signer",
    icon: "pencil",
    available: true,
  },
  {
    id: "background-remover",
    nameKey: "tools.backgroundRemover.name",
    descriptionKey: "tools.backgroundRemover.description",
    href: "/tools/background-remover",
    icon: "scissors",
    available: true,
  },
  {
    id: "json-formatter",
    nameKey: "tools.jsonFormatter.name",
    descriptionKey: "tools.jsonFormatter.description",
    href: "/tools/json-formatter",
    icon: "code",
    available: true,
  },
  {
    id: "url-shortener",
    nameKey: "tools.urlShortener.name",
    descriptionKey: "tools.urlShortener.description",
    href: "/tools/url-shortener",
    icon: "link",
    available: true,
  },
  {
    id: "title-case-converter",
    nameKey: "tools.titleCase.name",
    descriptionKey: "tools.titleCase.description",
    href: "/tools/title-case",
    icon: "text",
    available: true,
  },
  {
    id: "word-counter",
    nameKey: "tools.wordCounter.name",
    descriptionKey: "tools.wordCounter.description",
    href: "/tools/word-counter",
    icon: "document",
    available: true,
  },
  {
    id: "character-counter",
    nameKey: "tools.characterCounter.name",
    descriptionKey: "tools.characterCounter.description",
    href: "/tools/character-counter",
    icon: "calculator",
    available: false,
  },
  {
    id: "reading-time",
    nameKey: "tools.readingTime.name",
    descriptionKey: "tools.readingTime.description",
    href: "/tools/reading-time",
    icon: "clock",
    available: false,
  },
  {
    id: "headline-analyzer",
    nameKey: "tools.headlineAnalyzer.name",
    descriptionKey: "tools.headlineAnalyzer.description",
    href: "/tools/headline-analyzer",
    icon: "chart",
    available: false,
  },
];
