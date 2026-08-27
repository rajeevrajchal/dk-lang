import { Skeleton, SkeletonList } from "@/components/ui/states";

const Loading = () => {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6 sm:p-8" role="status" aria-busy="true">
      <span className="sr-only">Loading the verb collection…</span>
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
      <SkeletonList rows={4} lines={1} />
    </div>
  );
};

export default Loading;
