// src/components/FloatingHearts.tsx

const heartPath = 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z';

const Heart = ({ size, className }: { size: number; className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={`absolute z-0 ${className}`}>
    <path d={heartPath} />
  </svg>
);

// Arbitrary tailwind animation definitions to avoid inline styles
const HEARTS = [
  { size: 16, classes: 'top-[10%] right-[15%] text-[#E8899A] animate-[floatHeart_6s_ease-in-out_0s_infinite_alternate]' },
  { size: 12, classes: 'top-[25%] left-[10%] text-[#C4364A] animate-[floatHeart_6s_ease-in-out_0.5s_infinite_alternate]' },
  { size: 14, classes: 'bottom-[30%] right-[10%] text-[#F4A4B2] animate-[floatHeart_6s_ease-in-out_1s_infinite_alternate]' },
  { size: 10, classes: 'bottom-[15%] left-[15%] text-[#D4537E] animate-[floatHeart_6s_ease-in-out_1.5s_infinite_alternate]' },
];

const FloatingHearts = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    {HEARTS.map((heart, index) => (
      <Heart key={index} size={heart.size} className={heart.classes} />
    ))}
  </div>
);

export default FloatingHearts;
