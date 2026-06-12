// src/components/ui/Avatar.tsx
import { initials } from '@/utils/chat';

type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
  photoUrl?: string;
  first: string;
  last: string;
  size?: AvatarSize;
  online?: boolean;
  grayscale?: boolean;
}

const dimMap: Record<AvatarSize, string> = {
  sm: 'w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm',
  md: 'w-10 h-10 sm:w-12 sm:h-12 text-sm sm:text-base',
  lg: 'w-12 h-12 sm:w-14 sm:h-14 text-base sm:text-lg',
};

const dotMap: Record<AvatarSize, string> = {
  sm: 'w-2.5 h-2.5 sm:w-3 sm:h-3',
  md: 'w-3 h-3 sm:w-3.5 sm:h-3.5',
  lg: 'w-3.5 h-3.5 sm:w-4 sm:h-4',
};

export default function Avatar({
  photoUrl,
  first,
  last,
  size = 'md',
  online,
  grayscale = false,
}: AvatarProps) {
  return (
    <div className="relative shrink-0">
      <div
        className={`${dimMap[size]} rounded-full overflow-hidden flex items-center justify-center font-black border-2 ${
          grayscale
            ? 'bg-background text-text-muted border-border grayscale'
            : 'bg-surface text-primary border-primary/30'
        }`}
      >
        {photoUrl ? (
          <img src={photoUrl} alt={first} className="w-full h-full object-cover" />
        ) : (
          <span className="font-black tracking-wider">{initials(first, last)}</span>
        )}
      </div>
      {online !== undefined && !grayscale && (
        <span
          className={`absolute bottom-0 right-0 ${dotMap[size]} rounded-full border-2 border-surface ${
            online ? 'bg-green-500' : 'bg-border'
          }`}
        />
      )}
    </div>
  );
}
