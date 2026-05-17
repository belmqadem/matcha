import type { ReactNode } from 'react';

interface ButtonProps {
  onClick?: () => void;
  children: ReactNode;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'google' | '42' | 'secondary' | 'danger';
  className?: string;
  disabled?: boolean;
  withArrow?: boolean;
}

const Button = ({
  onClick,
  children,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled = false,
  withArrow = true,
}: ButtonProps) => {
  if (variant === 'google') {
    return (
      <button
        type={type}
        onClick={onClick}
        className={`w-full flex items-center justify-center gap-2 border border-(--color-text)/80 rounded-full py-3 font-semibold text-(--color-text) tracking-wider uppercase hover:bg-(--color-primary)/10 transition-colors ${className}`}
        disabled={disabled}
      >
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
          />
          <path
            fill="#FBBC05"
            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
          />
          <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
          />
        </svg>
      </button>
    );
  }

  if (variant === '42') {
    return (
      <button
        type={type}
        onClick={onClick}
        className={`w-full flex items-center justify-center gap-2 border border-(--color-text)/80 rounded-full py-3 font-semibold text-(--color-text) tracking-wider uppercase hover:bg-(--color-primary)/10 transition-colors ${className}`}
        disabled={disabled}
      >
        <img
          src="/src/assets/42-logo.png"
          alt="42"
          width={22}
          height={22}
          className="object-contain"
        />
      </button>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={`w-full flex items-center justify-center gap-2 rounded-full py-3 font-bold tracking-wider uppercase text-white transition-all hover:opacity-90 active:scale-95 ${className}`}
      style={{ background: 'linear-gradient(90deg, #C4364A, #e05570)' }}
    >
      {children}
      {withArrow && <span className="text-[10px]">▶</span>}
    </button>
  );
};

export default Button;
