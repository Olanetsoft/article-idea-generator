import { TitleCardSkeleton } from "./TitleCardSkeleton";
import type { TitleListSkeletonProps } from "@/types";

export function TitleListSkeleton({ count = 4 }: TitleListSkeletonProps) {
  return (
    <div className="space-y-4 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <TitleCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default TitleListSkeleton;
