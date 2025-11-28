import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({
  className = "",
  variant = "text",
  width,
  height,
  lines = 1,
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-gray-200 dark:bg-zinc-700 rounded";

  const variantClasses = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  const style: React.CSSProperties = {
    width: width,
    height: height,
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

// Skeleton for article title cards
export function TitleCardSkeleton() {
  return (
    <div className="w-full p-4 border border-gray-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 bg-gray-200 dark:bg-zinc-700 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 dark:bg-zinc-700 rounded w-full" />
          <div className="h-5 bg-gray-200 dark:bg-zinc-700 rounded w-3/4" />
        </div>
      </div>
      <div className="flex gap-2 mt-4 justify-end">
        <div className="w-20 h-8 bg-gray-200 dark:bg-zinc-700 rounded-lg" />
        <div className="w-24 h-8 bg-gray-200 dark:bg-zinc-700 rounded-lg" />
      </div>
    </div>
  );
}

// Skeleton for multiple title cards
export function TitleListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <TitleCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Skeleton for abstract generation
export function AbstractSkeleton() {
  return (
    <div className="w-full p-6 border border-gray-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 animate-pulse">
      <div className="h-5 bg-gray-200 dark:bg-zinc-700 rounded w-1/4 mb-4" />
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-5/6" />
        <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-4/5" />
      </div>
    </div>
  );
}

// Skeleton for search input area
export function SearchSkeleton() {
  return (
    <div className="w-full max-w-2xl animate-pulse">
      <div className="h-14 bg-gray-200 dark:bg-zinc-700 rounded-full" />
      <div className="flex gap-2 mt-4 justify-center">
        <div className="w-32 h-10 bg-gray-200 dark:bg-zinc-700 rounded-lg" />
      </div>
    </div>
  );
}

export default Skeleton;
