import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface CtaLinkProps {
  to: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md';
  icon?: ReactNode;
  fullWidth?: boolean;
  onClick?: () => void;
  className?: string;
}

const VARIANT_CLASSES: Record<NonNullable<CtaLinkProps['variant']>, string> = {
  primary:
    'bg-primary text-white font-semibold shadow-premium hover:scale-105 hover:shadow-glow active:scale-100',
  secondary:
    'border border-border bg-surface text-text-muted font-medium hover:border-primary hover:text-primary',
};

const SIZE_CLASSES: Record<NonNullable<CtaLinkProps['size']>, string> = {
  sm: 'px-5 py-2.5 text-sm',
  md: 'px-8 py-3.5 text-[0.95rem]',
};

const CtaLink = ({
  to,
  children,
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth = false,
  onClick,
  className = '',
}: CtaLinkProps) => (
  <Link
    to={to}
    onClick={onClick}
    className={`inline-flex items-center justify-center gap-2.5 rounded-full transition-all ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
  >
    {icon}
    {children}
  </Link>
);

export default CtaLink;
