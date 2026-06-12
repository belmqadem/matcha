// src/components/profile-setup/StepNavigation.tsx
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';

interface StepNavigationProps {
  step: number;
  totalSteps: number;
  isSkippable: boolean;
  loading: boolean;
  onBack: () => void;
  onSkip: () => void;
  onNext: () => void;
  onSkipAll: () => void;
  error?: string;
}

export const StepNavigation = ({
  step,
  totalSteps,
  isSkippable,
  loading,
  onBack,
  onSkip,
  onNext,
  onSkipAll,
  error,
}: StepNavigationProps) => {
  const isLast = step === totalSteps - 1;
  const isFirst = step === 0;

  return (
    <>
      {error && (
        <div className="mt-3 p-3 bg-error/10 rounded-lg border border-error/20 animate-fade-in-up">
          <p className="text-xs sm:text-sm font-medium text-error">{error}</p>
        </div>
      )}

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
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl border-2 border-border bg-surface flex items-center justify-center cursor-pointer text-text-muted transition-all duration-150 hover:border-primary hover:text-primary hover:bg-primary/5 active:scale-95"
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-3 ml-auto">
          {isSkippable && !isLast && (
            <button
              type="button"
              onClick={onSkip}
              className="text-xs sm:text-sm text-border font-medium transition-colors duration-150 hover:text-text-muted px-2 py-1"
            >
              Skip
            </button>
          )}

          <button
            type="button"
            disabled={loading}
            onClick={onNext}
            className={`
              flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl text-xs sm:text-sm
              font-semibold transition-all duration-200 active:scale-95
              ${
                loading
                  ? 'bg-border text-text-muted cursor-not-allowed'
                  : 'bg-primary text-surface shadow-lg shadow-primary/30 hover:-translate-y-0.5 hover:bg-primary-hover'
              }
            `}
          >
            {loading ? (
              'Saving…'
            ) : isLast ? (
              <>
                <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current text-surface" />
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

      <div className="text-center mt-5 sm:mt-6">
        <button
          type="button"
          onClick={onSkipAll}
          className="text-xs sm:text-sm text-border font-medium transition-colors duration-150 hover:text-text-muted"
        >
          Skip setup for now
        </button>
      </div>
    </>
  );
};
