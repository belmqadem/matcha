// src/components/Logo.tsx
import { NavLink } from 'react-router-dom';
import logo from '@/assets/logo.png';

interface MatchaLogoProps {
  to?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

const SIZE_CLASSES = {
  sm: 'w-9 h-9 sm:w-11 sm:h-11',
  md: 'w-14 h-14 sm:w-18 sm:h-18',
  lg: 'w-18 h-18 sm:w-22 sm:h-22',
};

const TEXT_SIZE_CLASSES = {
  sm: 'text-xl sm:text-2xl',
  md: 'text-2xl sm:text-3xl',
  lg: 'text-3xl sm:text-4xl',
};

export default function MatchaLogo({
  to = '/browse',
  size = 'md',
  className = '',
  showText = false,
}: MatchaLogoProps) {
  const img = (
    <img
      src={logo}
      alt="Matcha Logo"
      className={`object-cover ${SIZE_CLASSES[size]} ${className}`}
    />
  );

  const content = (
    <div className="flex items-center gap-1.5 select-none">
      {img}
      {showText && (
        <span
          className={`font-logo font-bold tracking-tight leading-none ${TEXT_SIZE_CLASSES[size]}`}
        >
          <span className="text-primary">M</span>
          <span className="text-black">atcha</span>
        </span>
      )}
    </div>
  );

  if (!to) return content;

  return (
    <NavLink to={to} className="inline-flex items-center hover:opacity-80 transition-opacity">
      {content}
    </NavLink>
  );
}
