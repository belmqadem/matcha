// src/components/profile-setup/FloatingHearts.tsx

// Pre-compiled Tailwind classes utilizing v4 arbitrary properties to eliminate inline styles entirely.
// Included arbitrary variables (e.g., [--wobble:14px]) that hook into the global @theme keyframes.
const STATIC_HEARTS = [
  {
    size: 20,
    classes:
      'left-[8%] bottom-[-40px] opacity-[0.15] animate-[floatHeart_16s_linear_1s_infinite] [--wobble:14px]',
  },
  {
    size: 14,
    classes:
      'left-[22%] bottom-[-30px] opacity-[0.08] animate-[floatHeart_20s_linear_4s_infinite] [--wobble:-10px]',
  },
  {
    size: 18,
    classes:
      'left-[35%] bottom-[-35px] opacity-[0.12] animate-[floatHeart_14s_linear_0s_infinite] [--wobble:18px]',
  },
  {
    size: 12,
    classes:
      'left-[48%] bottom-[-25px] opacity-[0.09] animate-[floatHeart_18s_linear_6s_infinite] [--wobble:-12px]',
  },
  {
    size: 22,
    classes:
      'left-[60%] bottom-[-45px] opacity-[0.14] animate-[floatHeart_15s_linear_2s_infinite] [--wobble:15px]',
  },
  {
    size: 16,
    classes:
      'left-[75%] bottom-[-30px] opacity-[0.11] animate-[floatHeart_19s_linear_5s_infinite] [--wobble:-8px]',
  },
  {
    size: 10,
    classes:
      'left-[88%] bottom-[-20px] opacity-[0.07] animate-[floatHeart_22s_linear_1s_infinite] [--wobble:10px]',
  },
  {
    size: 19,
    classes:
      'left-[15%] bottom-[-38px] opacity-[0.13] animate-[floatHeart_17s_linear_3s_infinite] [--wobble:-15px]',
  },
  {
    size: 15,
    classes:
      'left-[40%] bottom-[-30px] opacity-[0.10] animate-[floatHeart_21s_linear_8s_infinite] [--wobble:20px]',
  },
  {
    size: 21,
    classes:
      'left-[82%] bottom-[-42px] opacity-[0.15] animate-[floatHeart_16s_linear_7s_infinite] [--wobble:-18px]',
  },
];

export const FloatingHearts = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {STATIC_HEARTS.map((h, i) => (
        <div key={i} className={`absolute text-primary ${h.classes}`}>
          <svg width={h.size} height={h.size} viewBox="0 0 24 24" className="fill-current">
            <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" />
          </svg>
        </div>
      ))}
    </div>
  );
};
