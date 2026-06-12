const heartPath =
  'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z';

const Heart = ({ size, className }: { size: number; className: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`absolute z-[25] ${className}`}
  >
    <path d={heartPath} />
  </svg>
);

const HEARTS = [
  { size: 24, classes: 'left-[5%] text-primary/15 animate-[floatHeart_15s_linear_infinite]' },
  {
    size: 16,
    classes:
      'left-[12%] text-primary/10 animate-[floatHeart_18s_linear_infinite] [animation-delay:2s]',
  },
  {
    size: 20,
    classes:
      'left-[22%] text-pink-500/12 animate-[floatHeart_22s_linear_infinite] [animation-delay:5s]',
  },
  {
    size: 14,
    classes:
      'left-[32%] text-primary/8 animate-[floatHeart_16s_linear_infinite] [animation-delay:1s]',
  },
  {
    size: 28,
    classes:
      'left-[45%] text-rose-500/15 animate-[floatHeart_25s_linear_infinite] [animation-delay:8s]',
  },
  {
    size: 18,
    classes:
      'left-[55%] text-pink-400/10 animate-[floatHeart_20s_linear_infinite] [animation-delay:4s]',
  },
  {
    size: 12,
    classes:
      'left-[65%] text-primary/8 animate-[floatHeart_14s_linear_infinite] [animation-delay:7s]',
  },
  {
    size: 22,
    classes:
      'left-[75%] text-rose-400/12 animate-[floatHeart_19s_linear_infinite] [animation-delay:3s]',
  },
  {
    size: 26,
    classes:
      'left-[85%] text-primary/14 animate-[floatHeart_23s_linear_infinite] [animation-delay:6s]',
  },
  {
    size: 15,
    classes:
      'left-[92%] text-pink-500/10 animate-[floatHeart_17s_linear_infinite] [animation-delay:9s]',
  },
  {
    size: 18,
    classes:
      'left-[8%] text-rose-500/12 animate-[floatHeart_21s_linear_infinite] [animation-delay:11s]',
  },
  {
    size: 22,
    classes:
      'left-[28%] text-primary/10 animate-[floatHeart_24s_linear_infinite] [animation-delay:13s]',
  },
  {
    size: 14,
    classes:
      'left-[38%] text-pink-400/8 animate-[floatHeart_19s_linear_infinite] [animation-delay:10s]',
  },
  {
    size: 30,
    classes:
      'left-[50%] text-rose-500/15 animate-[floatHeart_27s_linear_infinite] [animation-delay:14s]',
  },
  {
    size: 20,
    classes:
      'left-[60%] text-primary/12 animate-[floatHeart_20s_linear_infinite] [animation-delay:12s]',
  },
  {
    size: 16,
    classes:
      'left-[70%] text-pink-500/10 animate-[floatHeart_16s_linear_infinite] [animation-delay:15s]',
  },
  {
    size: 24,
    classes:
      'left-[80%] text-rose-400/12 animate-[floatHeart_22s_linear_infinite] [animation-delay:16s]',
  },
  {
    size: 12,
    classes:
      'left-[90%] text-primary/8 animate-[floatHeart_15s_linear_infinite] [animation-delay:17s]',
  },
];

const FloatingHearts = () => (
  <div className="fixed inset-0 pointer-events-none z-[25] overflow-hidden">
    {HEARTS.map((heart, index) => (
      <Heart key={index} size={heart.size} className={heart.classes} />
    ))}
  </div>
);

export default FloatingHearts;
