import { type CSSProperties } from 'react';

const Heart = ({ size, style }: { size: number; style: CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={style}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

type FloatingHeart = {
  size: number;
  color: string;
  delay: string;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
};

const floatingHearts: readonly FloatingHeart[] = [
  { size: 16, color: '#E8899A', top: '10%', right: '15%', delay: '0s' },
  { size: 12, color: '#C4364A', top: '25%', left: '10%', delay: '0.5s' },
  { size: 14, color: '#F4A4B2', bottom: '30%', right: '10%', delay: '1s' },
  { size: 10, color: '#D4537E', bottom: '15%', left: '15%', delay: '1.5s' },
];

const FloatingHearts = () => (
  <>
    {floatingHearts.map((heart, index) => (
      <Heart
        key={index}
        size={heart.size}
        style={{
          position: 'absolute',
          color: heart.color,
          top: heart.top,
          bottom: heart.bottom,
          left: heart.left,
          right: heart.right,
          zIndex: 1,
          animation: `float 6s ease-in-out ${heart.delay} infinite alternate`,
        }}
      />
    ))}
    <style>{`
      @keyframes float {
        0% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-10px) rotate(6deg); }
        100% { transform: translateY(0) rotate(0deg); }
      }
    `}</style>
  </>
);

export default FloatingHearts;
