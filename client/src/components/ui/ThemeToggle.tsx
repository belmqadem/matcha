interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

function SunIcon() {
  return (
    <>
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="12" y1="17" x2="12" y2="20" transform="rotate(0,12,12)" />
        <line x1="12" y1="17" x2="12" y2="20" transform="rotate(45,12,12)" />
        <line x1="12" y1="17" x2="12" y2="20" transform="rotate(90,12,12)" />
        <line x1="12" y1="17" x2="12" y2="20" transform="rotate(135,12,12)" />
        <line x1="12" y1="17" x2="12" y2="20" transform="rotate(180,12,12)" />
        <line x1="12" y1="17" x2="12" y2="20" transform="rotate(225,12,12)" />
        <line x1="12" y1="17" x2="12" y2="20" transform="rotate(270,12,12)" />
        <line x1="12" y1="17" x2="12" y2="20" transform="rotate(315,12,12)" />
      </g>
      <circle fill="currentColor" cx="12" cy="12" r="5" />
    </>
  );
}

function MoonIcon() {
  return (
    <path
      fill="currentColor"
      d="M15.1,14.9c-3-0.5-5.5-3-6-6C8.8,7.1,9.1,5.4,9.9,4c0.4-0.8-0.4-1.7-1.2-1.4
         C4.6,4,1.8,7.9,2,12.5c0.2,5.1,4.4,9.3,9.5,9.5c4.5,0.2,8.5-2.6,9.9-6.6
         c0.3-0.8-0.6-1.7-1.4-1.2C18.6,14.9,16.9,15.2,15.1,14.9z"
    />
  );
}

export function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <label className="ts">
      {/* The checkbox drives all CSS sibling selectors */}
      <input
        className="ts__track"
        type="checkbox"
        role="switch"
        checked={isDark}
        onChange={onToggle}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      />

      {/* Outer left icon: Sun */}
      <svg className="ts__icon" viewBox="0 0 24 24" aria-hidden="true">
        <SunIcon />
      </svg>

      {/* Outer right icon: Moon */}
      <svg className="ts__icon" viewBox="0 0 24 24" aria-hidden="true">
        <MoonIcon />
      </svg>

      {/* Rolling colored fill (::before slides via CSS) */}
      <span className="ts__pill" />

      {/* Icons inside the rolling fill */}
      <span className="ts__pill-icons">
        <svg className="ts__icon" viewBox="0 0 24 24" aria-hidden="true">
          <SunIcon />
        </svg>
        <svg className="ts__icon" viewBox="0 0 24 24" aria-hidden="true">
          <MoonIcon />
        </svg>
      </span>

      <span className="ts__sr">Dark mode</span>
    </label>
  );
}
