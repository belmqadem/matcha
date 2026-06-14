import React from 'react';
import { Star, Eye, Shield } from 'lucide-react';

interface ProfileFameProps {
  fameRating: number;
}

export function ProfileFame({ fameRating }: ProfileFameProps) {
  const fame = Math.min(100, Math.max(0, fameRating));

  // Determine fame tier title
  let tier = 'Newcomer';
  let tierColor = 'text-text-muted bg-background/50 border-border/40';
  if (fame >= 80) {
    tier = 'Elite Match';
    tierColor = 'text-[#d97706] bg-[#fef3c7] border-[#fde68a]';
  } else if (fame >= 50) {
    tier = 'Popular';
    tierColor = 'text-[#8b5cf6] bg-[#ede9fe] border-[#ddd6fe]';
  } else if (fame >= 20) {
    tier = 'Rising Star';
    tierColor = 'text-primary bg-primary/10 border-primary/20';
  }

  return (
    <div className="bg-surface/85 backdrop-blur-md rounded-3xl p-4 border border-border/70 shadow-premium hover:shadow-glow/5 hover:border-primary/20 transition-all duration-500 w-full shrink-0">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-black text-text tracking-tight">Fame Rating</h3>
        <div className="flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
          <Star className="w-3.5 h-3.5 text-primary fill-current animate-pulse" />
          <span className="text-xs font-black text-primary">{fame}</span>
        </div>
      </div>

      {/* Progress Bar with safe Custom Properties */}
      <div className="h-2 rounded-full bg-background/50 overflow-hidden mb-2.5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-[#ff758c] shadow-[0_0_8px_rgba(233,64,87,0.3)] transition-all duration-1000 ease-out w-[var(--fame-width)]"
          style={{ '--fame-width': `${fame}%` } as React.CSSProperties}
        />
      </div>

      {/* Dynamic Fame Tier Badge */}
      <div className="flex justify-center mb-4">
        <span
          className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full border ${tierColor}`}
        >
          Tier: {tier}
        </span>
      </div>

      {/* Stats lists */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between py-2.5 border-t border-background/50">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-text-muted">
            <Eye className="w-4 h-4 text-primary" /> Profile Views
          </div>
          <span className="text-xs sm:text-sm font-black text-text">Hidden</span>
        </div>
        <div className="flex items-center justify-between py-2.5 border-t border-background/50">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-text-muted">
            <Shield className="w-4 h-4 text-primary" /> Verified Member
          </div>
          <span className="text-xs sm:text-sm font-black text-text">Yes</span>
        </div>
      </div>
    </div>
  );
}
