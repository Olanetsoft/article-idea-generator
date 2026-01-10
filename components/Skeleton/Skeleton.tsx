import React from "react";
import type { SkeletonProps, SkeletonVariant } from "@/types";

const variantClasses: Record<SkeletonVariant, string> = {
  text: "h-4 rounded",
  circular: "rounded-full",
  rectangular: "rounded-lg",
};

export function Skeleton({
  className = "",
  variant = "text",
  width,
  height,
  lines = 1,
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-gray-200 dark:bg-zinc-700 rounded";

  const style: React.CSSProperties = {
    width,
    height,
  };

  if (lines > 1) {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} ${variantClasses[variant]}`}
            style={{
              ...style,
              width: i === lines - 1 ? "75%" : width,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

export default Skeleton;
