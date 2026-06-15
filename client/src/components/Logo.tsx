import { NavLink } from 'react-router-dom';

interface MatchaLogoProps {
  to?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

const heartPath =
  'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z';

interface HeartProps {
  size?: number;
  color?: string;
}

export const Heart = ({ size = 24, color = 'var(--color-primary)' }: HeartProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d={heartPath} />
  </svg>
);

const TEXT_SIZE_CLASSES = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-3xl',
};

export default function MatchaLogo({
  to = '/browse',
  size = 'md',
  className = '',
}: MatchaLogoProps) {
  const content = (
    <div className={`flex items-center select-none ${className}`}>
      <Heart size={22} color="var(--color-primary)" />
      <span
        className={`font-primary font-bold tracking-tight text-text ${TEXT_SIZE_CLASSES[size]}`}
      >
        matcha<span className="text-primary">.</span>
      </span>
    </div>
  );

  if (!to) {
    return <div className="group/logo inline-flex items-center">{content}</div>;
  }

  return (
    <NavLink
      to={to}
      className="group/logo inline-flex items-center hover:opacity-80 transition-opacity"
    >
      {content}
    </NavLink>
  );
}
