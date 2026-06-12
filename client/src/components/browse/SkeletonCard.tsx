// src/components/browse/SkeletonCard.tsx

export function SkeletonCard() {
  return (
    <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-sm relative z-10">
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
