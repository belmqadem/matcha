import { FLOATING_HEARTS_COUNT } from './profileSetupConstants';

interface Heart {
  id: number;
  size: number;
  left: number;
  delay: number;
  duration: number;
  opacity: number;
  wobble: number;
}

const generateHearts = (): Heart[] => {
  return Array.from({ length: FLOATING_HEARTS_COUNT }, (_, i) => ({
    id: i,
    size: 8 + Math.random() * 14,
    left: 4 + Math.random() * 92,
    delay: Math.random() * 14,
    duration: 14 + Math.random() * 12,
    opacity: 0.07 + Math.random() * 0.08,
    wobble: 6 + Math.random() * 14,
  }));
};

export const FloatingHearts = () => {
  const hearts = generateHearts();

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map((h) => (
        <div
          key={h.id}
          className="absolute animate-floatHeart"
          style={{
            bottom: `${-h.size * 2}px`,
            left: `${h.left}%`,
            animationDelay: `${h.delay}s`,
            animationDuration: `${h.duration}s`,
            opacity: h.opacity,
            '--wobble': `${h.wobble}px`,
          } as React.CSSProperties & { '--wobble': string }}
        >
          <svg
            width={h.size}
            height={h.size}
            viewBox="0 0 24 24"
            fill="var(--color-primary)"
          >
            <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" />
          </svg>
        </div>
      ))}
    </div>
  );
};
