import { NavLink } from 'react-router-dom';
import { Heart } from 'lucide-react';

interface MatchaLogoProps {
  to?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

const HEART_SIZES = {
  sm: 18,
  md: 22,
  lg: 26,
};

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
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <Heart size={HEART_SIZES[size]} className="text-primary fill-primary shrink-0" />
      <span className={`font-primary font-bold tracking-tight text-text ${TEXT_SIZE_CLASSES[size]}`}>
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
