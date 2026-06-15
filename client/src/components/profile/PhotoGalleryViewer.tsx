import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Photo } from '@/types/user';

interface PhotoGalleryViewerProps {
  photos: Photo[];
  currentIndex: number;
  onClose: () => void;
  onChangeIndex: (index: number) => void;
}

export function PhotoGalleryViewer({
  photos,
  currentIndex,
  onClose,
  onChangeIndex,
}: PhotoGalleryViewerProps) {
  const total = photos.length;
  const currentPhoto = photos[currentIndex];

  const handleNext = () => {
    onChangeIndex((currentIndex + 1) % total);
  };

  const handlePrev = () => {
    onChangeIndex((currentIndex - 1 + total) % total);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, total]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!currentPhoto) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md select-none animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Top Bar (Header/Close) */}
      <div className="absolute top-0 inset-x-0 p-4 sm:p-6 flex items-center justify-between z-10 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
        <span className="text-white/85 text-xs sm:text-sm font-black tracking-widest uppercase pl-2 select-none">
          Photo Gallery ({currentIndex + 1} / {total})
        </span>
        <button
          onClick={onClose}
          type="button"
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-all active:scale-95 pointer-events-auto border border-white/10 backdrop-blur-xs"
          title="Close gallery"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Container */}
      <div className="relative w-full flex-1 flex items-center justify-center px-4 py-16 sm:px-12">
        {/* Left Control Arrow */}
        {total > 1 && (
          <button
            onClick={handlePrev}
            type="button"
            className="absolute left-4 sm:left-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-all active:scale-90 border border-white/5 backdrop-blur-xs z-10 hover:scale-105"
            title="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Image Display */}
        <div 
          className="relative max-w-full max-h-[75vh] flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl bg-black/40 border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={currentPhoto.url}
            alt={`Gallery ${currentIndex + 1}`}
            className="max-w-full max-h-[75vh] object-contain animate-fade-in-up duration-300 pointer-events-none"
          />
        </div>

        {/* Right Control Arrow */}
        {total > 1 && (
          <button
            onClick={handleNext}
            type="button"
            className="absolute right-4 sm:right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-all active:scale-90 border border-white/5 backdrop-blur-xs z-10 hover:scale-105"
            title="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Dots navigation at bottom */}
      {total > 1 && (
        <div className="absolute bottom-6 flex gap-2 justify-center z-10 py-1 px-3.5 rounded-full bg-white/5 border border-white/5 backdrop-blur-xs">
          {photos.map((_, idx) => (
            <button
              key={idx}
              onClick={() => onChangeIndex(idx)}
              type="button"
              className={`w-2 h-2 rounded-full transition-all duration-200 cursor-pointer ${
                currentIndex === idx ? 'bg-primary w-4' : 'bg-white/30 hover:bg-white/60'
              }`}
              title={`Go to photo ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>,
    document.body,
  );
}
