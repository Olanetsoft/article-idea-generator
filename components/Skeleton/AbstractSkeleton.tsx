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

export default AbstractSkeleton;
