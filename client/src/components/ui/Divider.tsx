// src/components/ui/Divider.tsx
const Divider = () => (
  <div className="flex items-center gap-3 sm:gap-4 my-5 sm:my-6 w-full">
    <div className="flex-1 h-[2px] bg-primary/20 rounded-full" />
    <span className="text-xs sm:text-sm text-primary/60 font-bold tracking-widest uppercase">
      OR
    </span>
    <div className="flex-1 h-[2px] bg-primary/20 rounded-full" />
  </div>
);

export default Divider;
