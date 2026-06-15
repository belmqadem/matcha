// src/components/profile/PhotoEditorModal.tsx
import { useState } from 'react';
import { RotateCw, Wand2, Loader2, AlertTriangle } from 'lucide-react';
import type { Photo } from '@/types/user';
import { EditModal } from './EditModal';
import { userService } from '@/services/userService';

interface PhotoEditorModalProps {
  photo: Photo;
  onClose: () => void;
  onSave: (updatedPhoto: Photo) => void;
}

const FILTERS = ['grayscale', 'sepia', 'blur', 'brighten', 'darken'] as const;
type Filter = (typeof FILTERS)[number];

/** Map our filter names to CSS filter strings */
function buildCssFilter(filter: Filter | '', intensity: number): string {
  // intensity 0-100 → 0-1 (or 0-2 for brighten/darken)
  const t = intensity / 100;
  switch (filter) {
    case 'grayscale':
      return `grayscale(${t})`;
    case 'sepia':
      return `sepia(${t})`;
    // blur: max 8px at full intensity
    case 'blur':
      return `blur(${(t * 8).toFixed(1)}px)`;
    // brighten: 1 = no change, 2 = full bright
    case 'brighten':
      return `brightness(${1 + t})`;
    // darken: 1 = no change, 0 = full dark
    case 'darken':
      return `brightness(${1 - t * 0.9})`;
    default:
      return '';
  }
}

export function PhotoEditorModal({ photo, onClose, onSave }: PhotoEditorModalProps) {
  const [activeFilter, setActiveFilter] = useState<Filter | ''>('');
  const [intensity, setIntensity] = useState(50);
  const [localRotation, setLocalRotation] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const serverSrc = photo.url;
  const previewFilter = activeFilter ? buildCssFilter(activeFilter, intensity) : '';

  const handleRotateClick = () => {
    setLocalRotation((r) => (r + 90) % 360);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      let currentPhoto = photo;

      // 1. If rotated, apply rotation first
      if (localRotation !== 0) {
        currentPhoto = await userService.rotatePhoto(photo.id, localRotation);
      }

      // 2. If filter selected, apply filter on top of the rotated version
      if (activeFilter !== '') {
        currentPhoto = await userService.applyFilter(photo.id, activeFilter, intensity);
      }

      // 3. Cache-bust the final image URL
      const bustedPhoto = {
        ...currentPhoto,
        url: `${currentPhoto.url.split('?')[0]}?t=${Date.now()}`,
      };

      onSave(bustedPhoto);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save photo.');
    } finally {
      setSaving(false);
    }
  };

  // Combine local rotation + filter preview into a single CSS transform/filter.
  const imgStyle = {
    transform: `rotate(${localRotation}deg)`,
    filter: previewFilter || 'none',
  } as React.CSSProperties;

  const isDirty = localRotation !== 0 || activeFilter !== '';

  return (
    <EditModal title="Edit Photo" onClose={onClose} maxWidth="max-w-sm sm:max-w-md md:max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
        {/* Preview Container */}
        <div className="relative mx-auto flex aspect-[4/5] w-full max-w-[240px] items-center justify-center overflow-hidden rounded-2xl border border-border bg-background shadow-inner sm:max-w-none">
          <img
            src={serverSrc}
            alt="Preview"
            className="h-full w-full object-cover transition-all duration-300"
            style={imgStyle}
          />
          {saving && (
            <div className="absolute inset-0 flex items-center justify-center bg-text/30">
              <Loader2 className="h-8 w-8 animate-spin text-surface" />
            </div>
          )}
        </div>

        {/* Controls Container */}
        <div className="flex w-full flex-col gap-5">
          {/* Rotate */}
          <div className="flex items-center justify-between rounded-2xl border border-border bg-background/50 p-3 sm:p-4">
            <span className="text-[0.65rem] font-bold uppercase tracking-widest text-text-muted sm:text-xs">
              Transform
            </span>
            <button
              type="button"
              onClick={handleRotateClick}
              disabled={saving}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl border-2 border-border bg-surface px-3 py-1.5 text-xs font-bold transition-all hover:border-primary hover:text-primary active:scale-95 disabled:opacity-50"
            >
              <RotateCw className="h-3.5 w-3.5" /> Rotate 90°
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-background/50 p-3 sm:p-4">
            <span className="flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-widest text-text-muted sm:text-xs">
              <Wand2 className="h-3 w-3" /> Filters
            </span>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActiveFilter(f === activeFilter ? '' : f)}
                  disabled={saving}
                  className={`shrink-0 cursor-pointer rounded-xl border-2 px-3 py-1.5 text-xs font-bold transition-all capitalize active:scale-95 ${
                    activeFilter === f
                      ? 'bg-primary border-primary text-surface'
                      : 'bg-surface border-border text-text-muted hover:text-text'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Intensity slider + Apply — only shown when a filter is selected */}
          {activeFilter && (
            <div className="flex animate-fade-in-up flex-col gap-3 rounded-2xl border border-border bg-background/50 p-3 sm:p-4">
              <div className="flex items-center justify-between text-[0.65rem] font-bold text-text-muted sm:text-xs">
                <span>Intensity</span>
                <span>{intensity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={intensity}
                onChange={(e) => setIntensity(parseInt(e.target.value))}
                className="w-full cursor-pointer accent-primary"
                disabled={saving}
              />
            </div>
          )}

          {error && (
            <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-error animate-fade-in-up">
              <AlertTriangle className="h-3.5 w-3.5" /> {error}
            </p>
          )}

          {/* Save & Cancel buttons */}
          <div className="mt-2 flex gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 cursor-pointer rounded-xl border-2 border-border bg-surface py-2.5 text-xs font-bold text-text-muted transition-all hover:bg-background active:scale-95 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !isDirty}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-bold text-surface shadow-md transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </EditModal>
  );
}
