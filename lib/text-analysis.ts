/**
 * Text analysis utilities for writing tools
 */

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function countCharacters(text: string, includeSpaces = true): number {
  return includeSpaces ? text.length : text.replace(/\s/g, "").length;
}

export function countSentences(text: string): number {
  return text.split(/[.!?]+/).filter((s) => s.trim()).length;
}

export function countParagraphs(text: string): number {
  return text.split(/\n\n+/).filter((p) => p.trim()).length;
}

export function calculateReadingTime(wordCount: number, wpm = 200): number {
  return Math.ceil(wordCount / wpm);
}

export function calculateSpeakingTime(wordCount: number, wpm = 150): number {
  return Math.ceil(wordCount / wpm);
}

const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "this",
  "that",
  "these",
  "those",
  "i",
  "you",
  "he",
  "she",
  "it",
  "we",
  "they",
  "what",
  "which",
  "who",
  "whom",
  "your",
  "my",
  "his",
  "her",
  "its",
  "our",
  "their",
  "as",
  "if",
  "then",
  "so",
  "than",
  "such",
  "no",
  "not",
  "only",
  "same",
  "just",
  "also",
  "into",
  "from",
  "about",
  "up",
  "down",
  "out",
  "off",
  "over",
  "under",
  "again",
  "once",
  "here",
  "there",
  "when",
  "where",
  "why",
  "how",
  "all",
  "each",
  "every",
  "both",
  "few",
  "more",
  "most",
  "other",
  "some",
  "any",
  "no",
  "nor",
  "too",
  "very",
  "can",
  "cannot",
]);

export function getKeywordDensity(
  text: string,
  topN = 5
): Array<{ word: string; count: number; percentage: number }> {
  const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
  const totalWords = words.length;

  if (totalWords === 0) return [];

  const freq: Record<string, number> = {};

  words.forEach((word) => {
    if (!STOP_WORDS.has(word) && word.length > 2) {
      freq[word] = (freq[word] || 0) + 1;
    }
  });

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word, count]) => ({
      word,
      count,
      percentage: Math.round((count / totalWords) * 100 * 10) / 10,
    }));
}

export function formatTime(minutes: number): string {
  if (minutes < 1) return "< 1 min";
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

export interface TextStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTime: number;
  speakingTime: number;
  topKeywords: Array<{ word: string; count: number; percentage: number }>;
}

export function analyzeText(text: string): TextStats {
  const words = countWords(text);
  return {
    words,
    characters: countCharacters(text, true),
    charactersNoSpaces: countCharacters(text, false),
    sentences: countSentences(text),
    paragraphs: countParagraphs(text),
    readingTime: calculateReadingTime(words),
    speakingTime: calculateSpeakingTime(words),
    topKeywords: getKeywordDensity(text, 5),
  };
}
