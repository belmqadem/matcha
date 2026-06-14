import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Photo } from '@/types/user';

interface ProfileLightboxProps {
  photos: Photo[];
  lightboxPhoto: number;
  setLightboxPhoto: (idx: number | null) => void;
}

export function ProfileLightbox({ photos, lightboxPhoto, setLightboxPhoto }: ProfileLightboxProps) {
  const sorted = photos.slice().sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxPhoto((lightboxPhoto - 1 + sorted.length) % sorted.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxPhoto((lightboxPhoto + 1) % sorted.length);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl animate-fade-in"
      onClick={() => setLightboxPhoto(null)}
    >
      <button
        onClick={() => setLightboxPhoto(null)}
        className="absolute top-4 right-4 text-surface hover:text-primary transition-colors p-2 cursor-pointer border-none bg-transparent"
        aria-label="Close preview"
      >
        <X className="w-8 h-8" />
      </button>

      {sorted.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 text-surface hover:text-primary transition-colors p-3 bg-surface/10 rounded-full hover:bg-surface/20 cursor-pointer border-none"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 text-surface hover:text-primary transition-colors p-3 bg-surface/10 rounded-full hover:bg-surface/20 cursor-pointer border-none"
            aria-label="Next image"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      <div
        className="max-w-[90vw] max-h-[85vh] flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={sorted[lightboxPhoto]?.url}
          alt="Gallery Preview"
          className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-surface/10 select-none"
        />
        {sorted.length > 1 && (
          <span className="text-surface/80 text-sm font-bold bg-surface/10 px-3 py-1.5 rounded-full select-none">
            {lightboxPhoto + 1} / {sorted.length}
          </span>
        )}
      </div>
    </div>
  );
}
