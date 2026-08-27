import { Skeleton, SkeletonList } from "@/components/ui/states";

const Loading = () => {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6 sm:p-8" role="status" aria-busy="true">
      <span className="sr-only">Loading your mistakes…</span>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-80" />
      <Skeleton className="h-28 w-full rounded-xl" />
      <SkeletonList rows={3} lines={3} />
    </div>
  );
};

export default Loading;
