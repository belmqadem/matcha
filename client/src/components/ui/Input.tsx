import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface InputProps {
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  icon?: LucideIcon;
  showPasswordIcon?: ReactNode;
}

const Input = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  icon: Icon,
  showPasswordIcon,
}: InputProps) => (
  <div className="relative flex items-center border-b border-(--color-primary)/30 rounded-md mb-4 pb-1 focus-within:border-(--color-primary) transition-colors">
    {Icon && <Icon className="w-4 h-4 text-(--color-primary)/80 mr-2" />}
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full bg-transparent text-(--color-text) placeholder:text-(--color-primary)/80 outline-none py-1 caret-(--color-primary)"
    />
    {showPasswordIcon && <div className="absolute right-4 opacity-80">{showPasswordIcon}</div>}
  </div>
);

export default Input;
