/**
 * Configuration for all tools in the /tools section
 */

import type { Tool, ToolIcon } from "@/types";

export type { Tool, ToolIcon };

export const tools: Tool[] = [
  {
    id: "word-counter",
    nameKey: "tools.wordCounter.name",
    descriptionKey: "tools.wordCounter.description",
    href: "/tools/word-counter",
    icon: "document",
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
    id: "title-case-converter",
    nameKey: "tools.titleCase.name",
    descriptionKey: "tools.titleCase.description",
    href: "/tools/title-case",
    icon: "text",
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
