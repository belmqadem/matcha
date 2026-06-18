// src/components/profile-setup/StepNavigation.tsx
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';

interface StepNavigationProps {
  step: number;
  totalSteps: number;
  loading: boolean;
  onBack: () => void;
  onNext: () => void;
}

export const StepNavigation = ({
  step,
  totalSteps,
  loading,
  onBack,
  onNext,
}: StepNavigationProps) => {
  const isLast = step === totalSteps - 1;
  const isFirst = step === 0;

  return (
    <>
      <div
        className={`
          flex items-center gap-3 mt-6
          ${isFirst ? 'justify-end' : 'justify-between'}
        `}
      >
        {step > 0 && (
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-border bg-surface flex items-center justify-center cursor-pointer text-text-muted transition-all duration-200 hover:border-primary hover:text-primary hover:scale-105 active:scale-95"
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-3 ml-auto">
          <button
            type="button"
            disabled={loading}
            onClick={onNext}
            className={`
              flex items-center gap-2 px-6 py-2.5 sm:px-7 sm:py-3 rounded-full text-xs sm:text-sm
              font-semibold transition-all duration-200 hover:scale-105 active:scale-95
              ${
                loading
                  ? 'bg-border text-text-muted cursor-not-allowed'
                  : 'bg-primary text-white shadow-premium'
              }
            `}
          >
            {loading ? (
              'Saving…'
            ) : isLast ? (
              <>
                <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                Complete
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="w-4 h-4 sm:w-4 sm:h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};
