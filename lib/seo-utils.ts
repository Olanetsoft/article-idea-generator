/**
 * SEO utilities for character limits and platform constraints
 */

import type { Platform, LimitCheck } from "@/types";

export const PLATFORM_LIMITS = {
  twitter: 280,
  metaTitle: 60,
  metaDescription: 160,
  linkedin: 3000,
  instagram: 2200,
  tiktok: 150,
  youtube: 100,
  facebook: 63206,
} as const;

export const PLATFORM_LABELS: Record<Platform, string> = {
  twitter: "Twitter/X",
  metaTitle: "Meta Title",
  metaDescription: "Meta Description",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube Title",
  facebook: "Facebook",
};

export function checkLimit(text: string, platform: Platform): LimitCheck {
  const count = text.length;
  const limit = PLATFORM_LIMITS[platform];
  return {
    count,
    limit,
    remaining: limit - count,
    isOver: count > limit,
    percentage: Math.min((count / limit) * 100, 100),
  };
}

export function checkAllLimits(text: string): Record<Platform, LimitCheck> {
  const results = {} as Record<Platform, LimitCheck>;
  for (const platform of Object.keys(PLATFORM_LIMITS) as Platform[]) {
    results[platform] = checkLimit(text, platform);
  }
  return results;
}
