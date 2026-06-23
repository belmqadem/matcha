interface SkeletonCardProps {
  height?: number;
}

export function SkeletonCard({ height }: SkeletonCardProps) {
  if (height) {
    return (
      <div
        className="w-full rounded-3xl overflow-hidden bg-surface border border-border shadow-xl"
        style={{ height }}
      >
        <div className="w-full h-full bg-gradient-to-r from-background via-surface to-background bg-[length:200%_100%] animate-pulse" />
      </div>
    );
  }

  // Grid fallback (kept for any other uses)
  return (
    <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-sm">
      <div className="relative w-full pb-[133%] bg-background">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-surface to-background bg-[length:200%_100%] animate-pulse" />
      </div>
      <div className="p-4">
        <div className="h-4 bg-background rounded-full w-[60%] mb-3" />
        <div className="h-3 bg-background rounded-full w-[40%]" />
      </div>
    </div>
  );
}
