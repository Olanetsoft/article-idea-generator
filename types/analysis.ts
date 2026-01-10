/**
 * Text analysis types
 */

export interface TextStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTime: number;
  speakingTime: number;
  topKeywords: KeywordDensity[];
}

export interface KeywordDensity {
  word: string;
  count: number;
  percentage: number;
}
