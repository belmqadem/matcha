// src/components/Logo.tsx
import { NavLink } from 'react-router-dom';

interface MatchaLogoProps {
  to?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

const TEXT_SIZE_CLASSES = {
  sm: 'text-xl sm:text-2xl',
  md: 'text-2xl sm:text-3xl',
  lg: 'text-3xl sm:text-4xl',
};

export default function MatchaLogo({
  to = '/browse',
  size = 'md',
  className = '',
}: MatchaLogoProps) {
  const content = (
    <div className={`flex items-center select-none ${className}`}>
      <span
        className={`font-primary font-bold tracking-tight leading-none ${TEXT_SIZE_CLASSES[size]}`}
      >
        <span className="text-primary inline-block">
          M
        </span>
        <span className="text-text transition-colors duration-300">atcha.</span>
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
