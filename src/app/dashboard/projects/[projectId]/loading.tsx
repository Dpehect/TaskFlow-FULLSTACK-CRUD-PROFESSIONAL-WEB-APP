import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectBoardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <div className="flex flex-col gap-3 lg:flex-row">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="min-h-[28rem] flex-1 space-y-3 rounded-xl border p-3"
          >
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
