import type { StepConfig } from '../../../types/profileSetup';

interface StepHeaderProps {
  step: number;
  totalSteps: number;
  config: StepConfig;
}

export const StepHeader = ({ step, totalSteps, config }: StepHeaderProps) => {
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-3.25 mb-5">
      {/* Icon container */}
      <div className="w-11 h-11 rounded-[13px] bg-primary/10 flex items-center justify-center flex-shrink-0 shadow-sm shadow-primary/14 border border-primary/15">
        <Icon size={20} className="text-primary" strokeWidth={1.8} />
      </div>

      {/* Text */}
      <div>
        <p className="text-xs font-semibold text-text-muted uppercase tracking-[0.08em] mb-0.5">
          Step {step + 1} of {totalSteps}
        </p>
        <h2 className="text-base font-bold text-text leading-tight">{config.title}</h2>
      </div>
    </div>
  );
};
