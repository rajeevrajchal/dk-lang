import { Skeleton, SkeletonList } from "@/components/ui/states";

// Shown while the history is fetched on the server.
//
// A route-level loading file rather than a spinner inside the page: the data
// is fetched during rendering, so there is no moment when the page itself
// could show one. Next.js streams this in its place.
const Loading = () => {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6 sm:p-8" role="status" aria-busy="true">
      <span className="sr-only">Loading your history…</span>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-80" />
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-24 rounded-full" />
        ))}
      </div>
      <SkeletonList rows={3} lines={3} />
    </div>
  );
};

export default Loading;
