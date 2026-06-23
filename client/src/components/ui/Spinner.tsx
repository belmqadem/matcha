// src/components/ui/Spinner.tsx

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_MAP = {
  sm: 'w-3.5 h-3.5 sm:w-4 sm:h-4',
  md: 'w-5 h-5 sm:w-6 sm:h-6',
  lg: 'w-8 h-8 sm:w-10 sm:h-10',
};

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <span
      className={`inline-block rounded-full border-2 animate-spin shrink-0 border-transparent border-t-current ${SIZE_MAP[size]} ${className}`}
      aria-label="Loading"
    />
  );
}
