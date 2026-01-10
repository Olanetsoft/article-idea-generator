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

export default SearchSkeleton;
