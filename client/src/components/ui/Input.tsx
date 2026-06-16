// src/components/ui/Input.tsx
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface InputProps {
  id: string;
  type?: string;
  label: string;
  value: string;
  onChange: (_e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  icon?: LucideIcon;
  showPasswordIcon?: ReactNode;
}

const Input = ({
  id,
  type = 'text',
  label,
  value,
  onChange,
  required = false,
  icon: Icon,
  showPasswordIcon,
}: InputProps) => (
  <div className="relative flex items-center border-b border-primary/30 rounded-t-md mb-5 sm:mb-6 focus-within:border-primary focus-within:bg-primary/5 transition-colors">
    {Icon && (
      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary/80 ml-1 mr-2 sm:mr-3 mt-1.5 flex-shrink-0" />
    )}

    <div className="relative flex-1">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder=" "
        className="
          peer w-full bg-transparent
          text-text text-sm sm:text-base
          outline-none
          pt-4 pb-1 sm:pt-5 sm:pb-1.5
          caret-primary
          placeholder:text-transparent
        "
      />
      <label
        htmlFor={id}
        className="
          absolute left-0 top-1/2 -translate-y-1/2
          text-sm sm:text-base text-primary/70
          pointer-events-none
          transition-all duration-200 origin-left
          peer-focus:top-1.5 peer-focus:-translate-y-0
          peer-focus:text-[0.65rem] sm:peer-focus:text-xs peer-focus:text-primary
          peer-not-placeholder-shown:top-1.5
          peer-not-placeholder-shown:-translate-y-0
          peer-not-placeholder-shown:text-[0.65rem] sm:peer-not-placeholder-shown:text-xs
          peer-not-placeholder-shown:text-primary
        "
      >
        {label}
      </label>
    </div>

    {showPasswordIcon && (
      <div className="absolute right-2 sm:right-4 z-10 flex items-center justify-center">
        {showPasswordIcon}
      </div>
    )}
  </div>
);

export default Input;
