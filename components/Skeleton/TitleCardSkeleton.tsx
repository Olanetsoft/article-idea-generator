export function TitleCardSkeleton() {
  return (
    <div
      className="w-full p-3 border border-zinc-200 dark:border-dark-border rounded-md bg-zinc-100 dark:bg-darkOffset animate-pulse"
      aria-hidden="true"
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-grow space-y-2">
          <div className="h-5 bg-gray-200 dark:bg-zinc-700 rounded w-full" />
          <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-1/3" />
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <div className="w-11 h-11 bg-gray-200 dark:bg-zinc-700 rounded-md" />
          <div className="w-11 h-11 bg-gray-200 dark:bg-zinc-700 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export default TitleCardSkeleton;
