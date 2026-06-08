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
      {/* Error message */}
      {error && (
        <div className="mt-2.5 p-2.5 bg-error/6 rounded-2.5 border border-error/15 animate-fadeIn">
          <p className="text-xs text-error">{error}</p>
        </div>
      )}

      {/* Navigation buttons */}
      <div
        className={`
          flex items-center gap-2.5 mt-5.5
          ${isFirst ? 'justify-end' : 'justify-between'}
        `}
      >
        {/* Back button */}
        {step > 0 && (
          <button
            type="button"
            onClick={onBack}
            className="w-10.5 h-10.5 rounded-3 border-[1.5px] border-border bg-white flex items-center justify-center cursor-pointer text-text-muted transition-all duration-150 hover:border-primary hover:text-primary hover:bg-primary/5"
            aria-label="Go back"
          >
            <ChevronLeft size={17} />
          </button>
        )}

        {/* Right side actions */}
        <div className="flex items-center gap-2.5 ml-auto">
          {/* Skip step */}
          {isSkippable && !isLast && (
            <button
              type="button"
              onClick={onSkip}
              className="text-xs text-border font-medium transition-colors duration-150 hover:text-text-muted px-1"
            >
              Skip
            </button>
          )}

          {/* Continue / Complete button */}
          <button
            type="button"
            disabled={loading}
            onClick={onNext}
            className={`
              flex items-center gap-1.5 px-5.5 py-2.75 rounded-3.25 text-xs
              font-semibold transition-all duration-200
              ${
                loading
                  ? 'bg-border text-text-muted cursor-not-allowed'
                  : 'bg-primary text-white shadow-lg shadow-primary/35 hover:-translate-y-0.5'
              }
            `}
          >
            {loading ? (
              'Saving…'
            ) : isLast ? (
              <>
                <Heart size={13} fill="white" />
                Complete setup
              </>
            ) : (
              <>
                Continue
                <ChevronRight size={13} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Skip all button */}
      <p className="text-center mt-3.5 mb-0">
        <button
          type="button"
          onClick={onSkipAll}
          className="text-xs text-border font-medium transition-colors duration-150 hover:text-text-muted"
        >
          Skip setup for now
        </button>
      </p>
    </>
  );
};
