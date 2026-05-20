import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface InputProps {
  id: string;
  type?: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
  <div className="relative flex items-center border-b border-(--color-primary)/30 rounded-md mb-6 focus-within:border-(--color-primary) transition-colors">
    {Icon && <Icon className="w-4 h-4 text-(--color-primary)/80 mr-2 mt-1.5 flex-shrink-0" />}

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
          text-(--color-text)
          outline-none
          pt-3 pb-0.5
          caret-(--color-primary)
          placeholder:text-transparent
        "
      />
      <label
        htmlFor={id}
        className="
          absolute left-0 top-1/2 -translate-y-1/2
          text-sm text-(--color-primary)/70
          pointer-events-none
          transition-all duration-200 origin-left
          peer-focus:top-0 peer-focus:-translate-y-[60%]
          peer-focus:text-[0.7rem] peer-focus:text-(--color-primary)
          peer-not-placeholder-shown:top-0
          peer-not-placeholder-shown:-translate-y-[60%]
          peer-not-placeholder-shown:text-[0.7rem]
          peer-not-placeholder-shown:text-(--color-primary)
        "
      >
        {label}
      </label>
    </div>

    {showPasswordIcon && <div className="absolute right-4 opacity-80">{showPasswordIcon}</div>}
  </div>
);

export default Input;
