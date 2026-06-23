// src/components/ui/OptionButton.tsx
import { Check } from 'lucide-react';

interface OptionButtonProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export const OptionButton = ({ label, selected, onClick }: OptionButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full px-4 py-3 sm:py-4 rounded-xl border-2 text-left
        flex items-center justify-between
        transition-all duration-200 ease-out active:scale-95
        ${
          selected
            ? 'border-primary bg-primary/10 shadow-md shadow-primary/20 scale-[1.02]'
            : 'border-border bg-surface shadow-sm hover:border-primary/50'
        }
      `}
    >
      <span
        className={`text-sm sm:text-base font-${selected ? 'semibold' : 'medium'} ${
          selected ? 'text-primary' : 'text-text'
        }`}
      >
        {label}
      </span>
      <div
        className={`
          w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center
          flex-shrink-0 transition-all duration-200
          ${selected ? 'border-primary bg-primary' : 'border-border bg-transparent'}
        `}
      >
        {selected && <Check className="w-3 h-3 sm:w-4 sm:h-4 text-surface" strokeWidth={3} />}
      </div>
    </button>
  );
};
