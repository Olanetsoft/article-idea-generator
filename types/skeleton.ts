/**
 * Skeleton component types
 */

export type SkeletonVariant = "text" | "circular" | "rectangular";

export interface SkeletonProps {
  className?: string;
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export interface TitleListSkeletonProps {
  count?: number;
}
