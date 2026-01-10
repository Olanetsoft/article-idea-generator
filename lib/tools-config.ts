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
    available: false,
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
