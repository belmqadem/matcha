interface StepDotsProps {
  total: number;
  current: number;
}

export const StepDots = ({ total, current }: StepDotsProps) => {
  return (
    <div className="flex justify-center gap-1.5 mb-7">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-[5px] rounded-full transition-all duration-400 cubic-bezier-[0.34,1.56,0.64,1] ${
            i === current
              ? 'w-6 bg-primary opacity-100'
              : i < current
                ? 'w-3 bg-primary opacity-100'
                : 'w-2 bg-border opacity-35'
          }`}
        />
      ))}
    </div>
  );
};
