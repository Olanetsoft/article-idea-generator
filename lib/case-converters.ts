/**
 * Case conversion utilities for the Title Case Converter tool
 * Supports 16 case styles for writing, programming, and special uses
 */

// ============================================================================
// Word Lists for Style Guides
// ============================================================================

const ARTICLES = ["a", "an", "the"];
const CONJUNCTIONS = ["and", "but", "or", "nor", "for", "yet", "so"];
const SHORT_PREPOSITIONS = [
  "at",
  "by",
  "in",
  "of",
  "on",
  "to",
  "up",
  "as",
  "per",
  "via",
];

// Combined lowercase words for title case styles
const TITLE_CASE_LOWERCASE = new Set([
  ...ARTICLES,
  ...CONJUNCTIONS,
  ...SHORT_PREPOSITIONS,
]);

// ============================================================================
// Types
// ============================================================================

export type CaseCategory = "writing" | "programming" | "special";

export interface CaseResult {
  id: string;
  label: string;
  result: string;
  description: string;
  category: CaseCategory;
  icon: string;
}

export interface ConversionStats {
  inputLength: number;
  wordCount: number;
  uniqueWords: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Capitalizes the first letter, lowercases the rest
 */
function capitalizeFirst(word: string): string {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/**
 * Preserves punctuation while transforming the word
 */
function preservePunctuation(
  word: string,
  transform: (w: string) => string,
): string {
  const leadingPunct = word.match(/^[^\w]*/)?.[0] || "";
  const trailingPunct = word.match(/[^\w]*$/)?.[0] || "";
  const core = word.slice(
    leadingPunct.length,
    word.length - (trailingPunct.length || 0) || undefined,
  );
  return leadingPunct + transform(core) + trailingPunct;
}

/**
 * Extracts only actual words (no whitespace)
 */
function getWords(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

// ============================================================================
// Writing Style Converters
// ============================================================================

/**
 * Title Case (AP Style)
 * - Capitalize major words
 * - Lowercase articles, conjunctions, short prepositions
 * - Always capitalize first and last word
 */
export function toTitleCaseAP(text: string): string {
  if (!text.trim()) return text;

  const words = getWords(text);
  const result = words.map((word, index, arr) => {
    return preservePunctuation(word, (w) => {
      const lower = w.toLowerCase();
      const isFirst = index === 0;
      const isLast = index === arr.length - 1;

      if (isFirst || isLast) return capitalizeFirst(w);
      if (TITLE_CASE_LOWERCASE.has(lower)) return lower;
      return capitalizeFirst(w);
    });
  });

  return result.join(" ");
}

/**
 * Title Case (Chicago Style)
 * - Same as AP but capitalizes longer prepositions (5+ letters)
 */
export function toTitleCaseChicago(text: string): string {
  if (!text.trim()) return text;

  const words = getWords(text);
  const result = words.map((word, index, arr) => {
    return preservePunctuation(word, (w) => {
      const lower = w.toLowerCase();
      const isFirst = index === 0;
      const isLast = index === arr.length - 1;

      if (isFirst || isLast) return capitalizeFirst(w);
      if (TITLE_CASE_LOWERCASE.has(lower)) return lower;
      return capitalizeFirst(w);
    });
  });

  return result.join(" ");
}

/**
 * APA Style (7th Edition)
 * - Capitalize words with 4+ letters
 * - Capitalize first word
 */
export function toTitleCaseAPA(text: string): string {
  if (!text.trim()) return text;

  const words = getWords(text);
  const result = words.map((word, index) => {
    return preservePunctuation(word, (w) => {
      if (index === 0 || w.length >= 4) return capitalizeFirst(w);
      return w.toLowerCase();
    });
  });

  return result.join(" ");
}

/**
 * Sentence case - First letter of each sentence capitalized
 */
export function toSentenceCase(text: string): string {
  if (!text.trim()) return text;

  return text
    .toLowerCase()
    .replace(/(^\s*\w|[.!?]\s+\w)/g, (match) => match.toUpperCase());
}

/**
 * Start Case - Every Word Capitalized
 */
export function toStartCase(text: string): string {
  if (!text.trim()) return text;

  return getWords(text)
    .map((word) => preservePunctuation(word, capitalizeFirst))
    .join(" ");
}

/**
 * UPPERCASE - All letters capitalized
 */
export function toUpperCase(text: string): string {
  return text.toUpperCase();
}

/**
 * lowercase - All letters lowercase
 */
export function toLowerCase(text: string): string {
  return text.toLowerCase();
}

// ============================================================================
// Programming Style Converters
// ============================================================================

/**
 * camelCase - firstWordLowerRestCapitalized
 */
export function toCamelCase(text: string): string {
  if (!text.trim()) return text;

  const words = text
    .trim()
    .replace(/[^\w\s-]/g, "")
    .split(/[\s_-]+/)
    .filter(Boolean);

  return words
    .map((word, index) => {
      const lower = word.toLowerCase();
      return index === 0 ? lower : capitalizeFirst(lower);
    })
    .join("");
}

/**
 * PascalCase - EveryWordCapitalized
 */
export function toPascalCase(text: string): string {
  if (!text.trim()) return text;

  const words = text
    .trim()
    .replace(/[^\w\s-]/g, "")
    .split(/[\s_-]+/)
    .filter(Boolean);

  return words.map((word) => capitalizeFirst(word.toLowerCase())).join("");
}

/**
 * snake_case - words_separated_by_underscores
 */
export function toSnakeCase(text: string): string {
  if (!text.trim()) return text;

  return text
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s-]+/g, "_")
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/_+/g, "_")
    .toLowerCase();
}

/**
 * kebab-case - words-separated-by-hyphens
 */
export function toKebabCase(text: string): string {
  if (!text.trim()) return text;

  return text
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/-+/g, "-")
    .toLowerCase();
}

/**
 * CONSTANT_CASE - UPPERCASE_WITH_UNDERSCORES
 */
export function toConstantCase(text: string): string {
  if (!text.trim()) return text;

  return text
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s-]+/g, "_")
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/_+/g, "_")
    .toUpperCase();
}

/**
 * dot.case - words.separated.by.dots
 */
export function toDotCase(text: string): string {
  if (!text.trim()) return text;

  return text
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, ".")
    .replace(/([a-z])([A-Z])/g, "$1.$2")
    .replace(/\.+/g, ".")
    .toLowerCase();
}

/**
 * path/case - words/separated/by/slashes
 */
export function toPathCase(text: string): string {
  if (!text.trim()) return text;

  return text
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "/")
    .replace(/([a-z])([A-Z])/g, "$1/$2")
    .replace(/\/+/g, "/")
    .toLowerCase();
}

// ============================================================================
// Special/Fun Converters
// ============================================================================

/**
 * aLtErNaTiNg CaSe - Alternating caps
 */
export function toAlternatingCase(text: string): string {
  if (!text.trim()) return text;

  let upper = true;
  return text
    .split("")
    .map((char) => {
      if (/[a-zA-Z]/.test(char)) {
        const result = upper ? char.toUpperCase() : char.toLowerCase();
        upper = !upper;
        return result;
      }
      return char;
    })
    .join("");
}

/**
 * iNVERSE cASE - Swaps case of each character
 */
export function toInverseCase(text: string): string {
  return text
    .split("")
    .map((char) => {
      if (char === char.toUpperCase()) return char.toLowerCase();
      if (char === char.toLowerCase()) return char.toUpperCase();
      return char;
    })
    .join("");
}

// ============================================================================
// Detection & Analysis
// ============================================================================

/**
 * Detect the current case style of input text
 */
export function detectCase(text: string): string | null {
  if (!text.trim()) return null;

  const trimmed = text.trim();

  // Single word or no spaces - check programming cases
  if (!trimmed.includes(" ")) {
    if (trimmed === trimmed.toUpperCase() && trimmed.includes("_")) {
      return "CONSTANT_CASE";
    }
    if (trimmed.includes("_") && trimmed === trimmed.toLowerCase()) {
      return "snake_case";
    }
    if (trimmed.includes("-") && trimmed === trimmed.toLowerCase()) {
      return "kebab-case";
    }
    if (trimmed.includes(".") && trimmed === trimmed.toLowerCase()) {
      return "dot.case";
    }
    if (trimmed.includes("/") && trimmed === trimmed.toLowerCase()) {
      return "path/case";
    }
    if (/^[a-z][a-zA-Z0-9]*$/.test(trimmed) && /[A-Z]/.test(trimmed)) {
      return "camelCase";
    }
    if (/^[A-Z][a-zA-Z0-9]*$/.test(trimmed) && /[a-z]/.test(trimmed)) {
      return "PascalCase";
    }
  }

  // Text with spaces
  if (trimmed === trimmed.toUpperCase()) {
    return "UPPERCASE";
  }
  if (trimmed === trimmed.toLowerCase()) {
    return "lowercase";
  }

  const words = trimmed.split(/\s+/);

  // Check Start Case (all words capitalized)
  const allCapitalized = words.every(
    (word) =>
      /^[A-Z]/.test(word) && word.slice(1) === word.slice(1).toLowerCase(),
  );
  if (allCapitalized && words.length > 1) {
    return "Start Case";
  }

  // Check sentence case
  const firstWordCap = /^[A-Z]/.test(words[0]);
  const restLower = words
    .slice(1)
    .every((w) => w === w.toLowerCase() || /^[A-Z][a-z]*$/.test(w));
  if (firstWordCap && restLower && words.length > 1) {
    return "Sentence case";
  }

  // Check alternating case
  let isAlternating = true;
  let expectUpper = /[A-Z]/.test(trimmed[0]);
  for (const char of trimmed) {
    if (/[a-zA-Z]/.test(char)) {
      const isUpper = char === char.toUpperCase();
      if (isUpper !== expectUpper) {
        isAlternating = false;
        break;
      }
      expectUpper = !expectUpper;
    }
  }
  if (isAlternating && trimmed.length > 3) {
    return "aLtErNaTiNg";
  }

  return "Mixed";
}

/**
 * Get statistics about the input text
 */
export function getTextStats(text: string): ConversionStats {
  const words = getWords(text);
  const uniqueWords = new Set(words.map((w) => w.toLowerCase()));

  return {
    inputLength: text.length,
    wordCount: words.length,
    uniqueWords: uniqueWords.size,
  };
}

// ============================================================================
// Main Conversion Function
// ============================================================================

/**
 * Convert text to all supported case styles
 */
export function convertAll(text: string): CaseResult[] {
  return [
    // Writing Styles
    {
      id: "title-ap",
      label: "Title Case (AP)",
      result: toTitleCaseAP(text),
      description: "News & journalism",
      category: "writing",
      icon: "📰",
    },
    {
      id: "title-chicago",
      label: "Title Case (Chicago)",
      result: toTitleCaseChicago(text),
      description: "Books & publishing",
      category: "writing",
      icon: "📚",
    },
    {
      id: "title-apa",
      label: "APA Style",
      result: toTitleCaseAPA(text),
      description: "Academic papers",
      category: "writing",
      icon: "🎓",
    },
    {
      id: "sentence",
      label: "Sentence case",
      result: toSentenceCase(text),
      description: "Standard sentences",
      category: "writing",
      icon: "💬",
    },
    {
      id: "start",
      label: "Start Case",
      result: toStartCase(text),
      description: "Every Word Caps",
      category: "writing",
      icon: "✨",
    },
    {
      id: "upper",
      label: "UPPERCASE",
      result: toUpperCase(text),
      description: "ALL CAPS",
      category: "writing",
      icon: "🔠",
    },
    {
      id: "lower",
      label: "lowercase",
      result: toLowerCase(text),
      description: "all small",
      category: "writing",
      icon: "🔡",
    },
    // Programming Styles
    {
      id: "camel",
      label: "camelCase",
      result: toCamelCase(text),
      description: "JS variables",
      category: "programming",
      icon: "🐪",
    },
    {
      id: "pascal",
      label: "PascalCase",
      result: toPascalCase(text),
      description: "Class names",
      category: "programming",
      icon: "📦",
    },
    {
      id: "snake",
      label: "snake_case",
      result: toSnakeCase(text),
      description: "Python/Ruby",
      category: "programming",
      icon: "🐍",
    },
    {
      id: "kebab",
      label: "kebab-case",
      result: toKebabCase(text),
      description: "URLs & CSS",
      category: "programming",
      icon: "🍢",
    },
    {
      id: "constant",
      label: "CONSTANT_CASE",
      result: toConstantCase(text),
      description: "Constants",
      category: "programming",
      icon: "🔒",
    },
    {
      id: "dot",
      label: "dot.case",
      result: toDotCase(text),
      description: "Properties",
      category: "programming",
      icon: "⚫",
    },
    {
      id: "path",
      label: "path/case",
      result: toPathCase(text),
      description: "File paths",
      category: "programming",
      icon: "📁",
    },
    // Special Styles
    {
      id: "alternating",
      label: "aLtErNaTiNg",
      result: toAlternatingCase(text),
      description: "Mocking text",
      category: "special",
      icon: "🎭",
    },
    {
      id: "inverse",
      label: "iNVERSE",
      result: toInverseCase(text),
      description: "Flip the case",
      category: "special",
      icon: "🔄",
    },
  ];
}

// ============================================================================
// Sample Texts for Demo
// ============================================================================

export const SAMPLE_TEXTS = [
  { text: "the quick brown fox jumps over the lazy dog", label: "Pangram" },
  { text: "How to Build a REST API with Node.js", label: "Blog title" },
  { text: "user authentication service", label: "Variable name" },
  { text: "BREAKING NEWS TODAY", label: "Headline" },
  { text: "myAwesomeFunction", label: "camelCase" },
];
