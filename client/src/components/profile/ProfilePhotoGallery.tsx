import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import type { Photo } from '@/types/user';
import { timeAgo } from './profileConstants';

interface ProfilePhotoGalleryProps {
  photos: Photo[];
  activePhoto: number;
  setActivePhoto: React.Dispatch<React.SetStateAction<number>>;
  onPhotoClick: () => void;
  isOnline: boolean;
  lastSeen: string | null;
  firstName: string;
}

export function ProfilePhotoGallery({
  photos,
  activePhoto,
  setActivePhoto,
  onPhotoClick,
  isOnline,
  lastSeen,
  firstName,
}: ProfilePhotoGalleryProps) {
  const sorted = photos.slice().sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  const activeUrl = sorted[activePhoto]?.url ?? sorted[0]?.url;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhoto((prev) => (prev - 1 + sorted.length) % sorted.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhoto((prev) => (prev + 1) % sorted.length);
  };

  return (
    <div className="relative w-full md:w-80 shrink-0 aspect-[3/4] md:aspect-[3/4] flex flex-col items-center justify-center p-3 sm:p-4 bg-surface/40 backdrop-blur-md border border-border/40 rounded-3xl md:rounded-[2rem]">
      {/* Ambient Blurred Backlight matching the active photo */}
      {activeUrl && (
        <div
          className="absolute inset-0 -z-10 rounded-[2rem] blur-[40px] opacity-[0.25] transition-all duration-1000 scale-95 pointer-events-none"
          style={{
            backgroundImage: `url(${activeUrl})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        />
      )}

      {/* Main Image Container */}
      <div
        onClick={onPhotoClick}
        className="relative w-full h-full overflow-hidden cursor-pointer group/photo rounded-2xl md:rounded-[1.5rem] shadow-premium hover:shadow-glow transition-all duration-500 bg-background"
      >
        {activeUrl ? (
          <img
            src={activeUrl}
            alt={firstName}
            className="w-full h-full object-cover block transition-transform duration-700 group-hover/photo:scale-105 select-none"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted text-6xl font-black bg-background opacity-55 select-none">
            {firstName[0]}
          </div>
        )}

        {/* Elegant subtle gradient overlays */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-1/6 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />

        {/* Navigation arrows (sleek, high-glassmorphism chevrons) */}
        {sorted.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-surface/25 hover:bg-surface/45 text-text border border-white/20 flex items-center justify-center backdrop-blur-md transition-all z-10 cursor-pointer shadow-md opacity-0 group-hover/photo:opacity-100 hover:scale-105 active:scale-95 duration-300"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 text-surface" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-surface/25 hover:bg-surface/45 text-text border border-white/20 flex items-center justify-center backdrop-blur-md transition-all z-10 cursor-pointer shadow-md opacity-0 group-hover/photo:opacity-100 hover:scale-105 active:scale-95 duration-300"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 text-surface" />
            </button>
          </>
        )}

        {/* Dot Indicators */}
        {sorted.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {sorted.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePhoto(idx);
                }}
                className={`w-1.5 h-1.5 rounded-full border-none p-0 cursor-pointer transition-all duration-300 ${
                  activePhoto === idx ? 'bg-primary w-4' : 'bg-surface/50 hover:bg-surface/80'
                }`}
                aria-label={`Go to photo ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Image count pills */}
        {sorted.length > 1 && (
          <span className="absolute top-4 right-4 bg-black/45 text-surface text-[10px] font-black px-2.5 py-1 rounded-full tracking-widest z-10 backdrop-blur-md shadow-sm select-none">
            {activePhoto + 1}/{sorted.length}
          </span>
        )}

        {/* Online/Offline status badge */}
        <div className="absolute bottom-4 left-4 z-10 select-none">
          {isOnline ? (
            <span className="flex items-center gap-2 bg-success/95 text-surface text-[0.65rem] font-bold px-3 py-1.5 rounded-full tracking-wider shadow-lg shadow-success/20 border border-white/10">
              <span className="w-2 h-2 bg-surface rounded-full animate-ping absolute opacity-75" />
              <span className="w-2 h-2 bg-surface rounded-full relative" />
              ONLINE
            </span>
          ) : lastSeen ? (
            <span className="flex items-center gap-1.5 bg-black/45 backdrop-blur-md text-surface text-[0.65rem] font-black px-3 py-1.5 rounded-full shadow-md border border-white/10">
              <Clock className="w-3.5 h-3.5 text-surface/80" /> {timeAgo(lastSeen)}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
