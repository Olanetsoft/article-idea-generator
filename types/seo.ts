/**
 * SEO and platform-related types
 */

export type Platform =
  | "twitter"
  | "metaTitle"
  | "metaDescription"
  | "linkedin"
  | "instagram"
  | "tiktok"
  | "youtube"
  | "facebook";

export interface LimitCheck {
  count: number;
  limit: number;
  remaining: number;
  isOver: boolean;
  percentage: number;
}

export type PlatformLimits = Record<Platform, number>;
export type PlatformLabels = Record<Platform, string>;
