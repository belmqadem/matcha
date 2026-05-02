import { Eye, EyeOff } from 'lucide-react';

const ShowPasswordButton = ({
  password,
  className,
  ariaLabel,
}: {
  password: { isVisible: boolean; toggleVisibility: () => void };
  className?: string;
  ariaLabel?: string;
}) => {
  return (
    <button
      type="button"
      aria-label={ariaLabel ?? (password.isVisible ? 'Hide password' : 'Show password')}
      onClick={password.toggleVisibility}
      className={
        'text-sm text-(--color-primary)/80 hover:text-(--color-primary) transition-colors flex items-center' +
        (className ? ` ${className}` : '')
      }
    >
      {password.isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );
};

export default ShowPasswordButton;
