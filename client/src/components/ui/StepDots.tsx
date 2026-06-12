// src/components/ui/StepDots.tsx

interface StepDotsProps {
  total: number;
  current: number;
}

export const StepDots = ({ total, current }: StepDotsProps) => {
  return (
    <div className="flex justify-center gap-1.5 sm:gap-2 mb-6 sm:mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
            i === current
              ? 'w-6 sm:w-8 bg-primary opacity-100'
              : i < current
                ? 'w-3 sm:w-4 bg-primary opacity-100'
                : 'w-2 sm:w-2.5 bg-border opacity-50'
          }`}
        />
      ))}
    </div>
  );
};
