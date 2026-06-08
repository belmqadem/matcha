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
    <div>
      {/* Photo grid */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {photos.map((file, i) => (
          <div
            key={i}
            className={`
              relative aspect-square rounded-[14px] overflow-hidden
              transition-all duration-250 animate-popIn
              ${
                i === 0
                  ? 'border-2 border-primary shadow-lg shadow-primary/22'
                  : 'border-[1.5px] border-border'
              }
            `}
          >
            <img
              src={URL.createObjectURL(file)}
              alt={`Photo ${i + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Main badge */}
            {i === 0 && (
              <span className="absolute bottom-1.5 left-1.5 text-xs bg-primary text-white px-1.75 py-0.5 rounded-full font-semibold">
                Main
              </span>
            )}

            {/* Remove button */}
            <button
              type="button"
              onClick={() => onRemovePhoto(i)}
              className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/45 text-white hover:bg-black/60 flex items-center justify-center transition-all duration-150"
              aria-label="Remove photo"
            >
              <X size={10} />
            </button>
          </div>
        ))}

        {/* Add photo button */}
        {photos.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={`
              aspect-square rounded-[14px] border-[1.5px] border-dashed border-border
              bg-background flex flex-col items-center justify-center gap-1
              text-border cursor-pointer transition-all duration-200
              hover:border-primary hover:text-primary hover:bg-primary/5
            `}
            aria-label="Add photo"
          >
            <Camera size={18} />
            <span className="text-xs font-medium">Add photo</span>
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Photo count indicator */}
      <div className="flex justify-center gap-1">
        {Array.from({ length: MAX_PHOTOS }).map((_, i) => (
          <div
            key={i}
            className={`
              w-1.75 h-1.75 rounded-full transition-all duration-200
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
