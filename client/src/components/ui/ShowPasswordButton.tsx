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
      className={`text-primary/70 hover:text-primary active:scale-95 transition-all flex items-center justify-center p-2 rounded-full hover:bg-primary/10 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${className}`}
    >
      {password.isVisible ? (
        <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
      ) : (
        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
      )}
    </button>
  );
};

export default ShowPasswordButton;
