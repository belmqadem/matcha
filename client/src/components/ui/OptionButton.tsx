import { Check } from 'lucide-react';

interface OptionButtonProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export const OptionButton = ({
  label,
  selected,
  onClick,
}: OptionButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full px-4 py-3 rounded-[14px] border-[1.5px] text-left
        flex items-center justify-between
        transition-all duration-200 ease-out
        ${
          selected
            ? 'border-primary bg-primary/7 shadow-md shadow-primary/18 scale-101'
            : 'border-border bg-white shadow-sm shadow-black/4'
        }
      `}
    >
      <span
        className={`text-sm font-${selected ? 600 : 400} ${
          selected ? 'text-primary' : 'text-text'
        }`}
      >
        {label}
      </span>

      <div
        className={`
          w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center
          flex-shrink-0 transition-all duration-200
          ${selected ? 'border-primary bg-primary' : 'border-border bg-transparent'}
        `}
      >
        {selected && <Check size={11} color="#fff" strokeWidth={3} />}
      </div>
    </button>
  );
};
