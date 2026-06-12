// src/components/profile-setup/PhotoGrid.tsx
import { Camera, X } from 'lucide-react';
import { useRef } from 'react';
import { MAX_PHOTOS } from './profileSetupConstants';

interface PhotoGridProps {
  photos: File[];
  onAddPhotos: (files: File[]) => void;
  onRemovePhoto: (index: number) => void;
}

export const PhotoGrid = ({
  photos,
  onAddPhotos,
  onRemovePhoto,
}: PhotoGridProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    onAddPhotos(files);
    e.target.value = '';
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-5">
        {photos.map((file, i) => (
          <div
            key={i}
            className={`
              relative aspect-square rounded-xl overflow-hidden
              transition-all duration-300 animate-fade-in-up
              ${
                i === 0
                  ? 'border-2 border-primary shadow-lg shadow-primary/30'
                  : 'border-2 border-border'
              }
            `}
          >
            <img
              src={URL.createObjectURL(file)}
              alt={`Photo ${i + 1}`}
              className="w-full h-full object-cover"
            />

            {i === 0 && (
              <span className="absolute bottom-2 left-2 text-[0.65rem] sm:text-xs bg-primary text-surface px-2 sm:px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Main
              </span>
            )}

            <button
              type="button"
              onClick={() => onRemovePhoto(i)}
              className="absolute top-2 right-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-text/50 text-surface hover:bg-text/80 flex items-center justify-center transition-all duration-150 backdrop-blur-sm active:scale-95"
              aria-label="Remove photo"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        ))}

        {photos.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={`
              aspect-square rounded-xl border-2 border-dashed border-border
              bg-background flex flex-col items-center justify-center gap-1 sm:gap-2
              text-text-muted cursor-pointer transition-all duration-200
              hover:border-primary hover:text-primary hover:bg-primary/5 active:scale-95
            `}
            aria-label="Add photo"
          >
            <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-[0.65rem] sm:text-xs font-semibold uppercase tracking-wider">Add photo</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex justify-center gap-1.5 sm:gap-2">
        {Array.from({ length: MAX_PHOTOS }).map((_, i) => (
          <div
            key={i}
            className={`
              w-2 h-2 rounded-full transition-all duration-300
              ${
                i < photos.length
                  ? 'bg-primary scale-125'
                  : 'bg-border scale-100'
              }
            `}
          />
        ))}
      </div>
    </div>
  );
};
