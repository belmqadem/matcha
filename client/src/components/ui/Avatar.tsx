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
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-[15px]',
};

const dotMap: Record<AvatarSize, string> = {
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
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
          <span className="font-black">{initials(first, last)}</span>
        )}
      </div>

      {online !== undefined && !grayscale && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 ${dotMap[size]} rounded-full border-2 border-surface ${
            online ? 'bg-success' : 'bg-border'
          }`}
        />
      )}
    </div>
  );
}
