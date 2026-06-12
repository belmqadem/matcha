// src/components/profile-setup/StepHeader.tsx
import type { StepConfig } from '../../../types/profileSetup';

interface StepHeaderProps {
  step: number;
  totalSteps: number;
  config: StepConfig;
}

export const StepHeader = ({ step, totalSteps, config }: StepHeaderProps) => {
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
      {/* Icon container */}
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 shadow-sm border border-primary/15">
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" strokeWidth={1.8} />
      </div>

      {/* Text */}
      <div>
        <p className="text-[0.65rem] sm:text-xs font-semibold text-text-muted uppercase tracking-[0.08em] mb-0.5 sm:mb-1">
          Step {step + 1} of {totalSteps}
        </p>
        <h2 className="text-sm sm:text-base font-bold text-text leading-tight">
          {config.title}
        </h2>
      </div>
    </div>
  );
};
