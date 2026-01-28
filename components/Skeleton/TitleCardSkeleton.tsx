export function TitleCardSkeleton() {
  return (
    <div className="w-full p-4 border border-gray-200 dark:border-dark-border rounded-xl bg-white dark:bg-dark-card animate-pulse">
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

export default TitleCardSkeleton;
