// src/components/ui/ShowPasswordButton.tsx
import { Eye, EyeOff } from 'lucide-react';

interface ShowPasswordButtonProps {
  password: { isVisible: boolean; toggleVisibility: () => void };
  className?: string;
  ariaLabel?: string;
}

const ShowPasswordButton = ({
  password,
  className = '',
  ariaLabel,
}: ShowPasswordButtonProps) => {
  return (
    <button
      type="button"
      aria-label={ariaLabel ?? (password.isVisible ? 'Hide password' : 'Show password')}
      onClick={password.toggleVisibility}
      className={`text-sm text-primary/80 hover:text-primary transition-colors flex items-center ${className}`}
    >
      {password.isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );
};

export default ShowPasswordButton;
