// src/components/profile/PhotoEditorModal.tsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { RotateCw, Wand2, Loader2, X } from 'lucide-react';
import type { Photo } from '@/types/user';
import { userService } from '@/services/userService';

interface PhotoEditorModalProps {
  photo: Photo;
  onClose: () => void;
  onSave: (_updatedPhoto: Photo) => void;
}

const FILTERS = [
  { id: 'grayscale' as const, label: 'B&W' },
  { id: 'sepia' as const, label: 'Sepia' },
  { id: 'blur' as const, label: 'Blur' },
  { id: 'brighten' as const, label: 'Brighten' },
  { id: 'darken' as const, label: 'Darken' },
];

type Filter = (typeof FILTERS)[number]['id'];

function buildCssFilter(filter: Filter, intensity: number): string {
  const t = intensity / 100;
  switch (filter) {
    case 'grayscale':
      return `grayscale(${t})`;
    case 'sepia':
      return `sepia(${t})`;
    case 'blur':
      return `blur(${(t * 8).toFixed(1)}px)`;
    case 'brighten':
      return `brightness(${1 + t})`;
    case 'darken':
      return `brightness(${1 - t * 0.9})`;
  }
}

export function PhotoEditorModal({ photo, onClose, onSave }: PhotoEditorModalProps) {
  const [activeFilter, setActiveFilter] = useState<Filter | ''>('');
  const [intensity, setIntensity] = useState(50);
  const [rotation, setRotation] = useState(0);
  const [saving, setSaving] = useState(false);

  const isDirty = rotation !== 0 || activeFilter !== '';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleReset = () => {
    setRotation(0);
    setActiveFilter('');
    setIntensity(50);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let current = photo;
      if (rotation !== 0) current = await userService.rotatePhoto(photo.id, rotation);
      if (activeFilter !== '')
        current = await userService.applyFilter(photo.id, activeFilter, intensity);
      onSave({ ...current, url: `${current.url.split('?')[0]}?t=${Date.now()}` });
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save photo.');
    } finally {
      setSaving(false);
    }
  };

  const imgStyle = {
    transform: `rotate(${rotation}deg)`,
    filter: activeFilter ? buildCssFilter(activeFilter as Filter, intensity) : 'none',
    transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), filter 0.2s ease',
  } as React.CSSProperties;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-text/50 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-surface w-full max-w-xl rounded-3xl shadow-2xl animate-fade-in-up overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-base font-black text-text">Edit Photo</h3>
          <div className="flex items-center gap-2">
            {isDirty && (
              <button
                type="button"
                onClick={handleReset}
                disabled={saving}
                className="text-[11px] font-bold text-text-muted hover:text-text px-3 py-1.5 rounded-full hover:bg-background transition-colors active:scale-95 disabled:opacity-40"
              >
                Reset
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text-muted hover:bg-background transition-colors active:scale-95 disabled:opacity-40"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col sm:flex-row">
          {/* Preview — square container with object-contain so rotation never clips */}
          <div className="sm:w-[45%] bg-black/90 flex items-center justify-center p-5 sm:p-6">
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black/60">
              <img
                src={photo.url}
                alt="Preview"
                className="absolute inset-0 w-full h-full object-contain"
                style={imgStyle}
              />
              {saving && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
                  <Loader2 className="w-8 h-8 animate-spin text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="sm:w-[55%] p-5 sm:p-6 flex flex-col gap-5 border-t sm:border-t-0 sm:border-l border-border">
            {/* Rotate */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2.5">
                Transform
              </p>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-background text-xs font-bold text-text hover:border-primary hover:text-primary transition-all active:scale-95 disabled:opacity-50"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  Rotate 90°
                </button>
                {rotation !== 0 && (
                  <span className="text-xs font-black text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
                    {rotation}°
                  </span>
                )}
              </div>
            </div>

            {/* Filters */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2.5 flex items-center gap-1.5">
                <Wand2 className="w-3 h-3" /> Filters
              </p>
              <div className="grid grid-cols-3 gap-2">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      const next = f.id === activeFilter ? '' : f.id;
                      setActiveFilter(next);
                      if (next !== '' && next !== activeFilter) setIntensity(50);
                    }}
                    disabled={saving}
                    className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all active:scale-95 disabled:opacity-50 ${
                      activeFilter === f.id
                        ? 'bg-primary border-primary text-white shadow-sm shadow-primary/20'
                        : 'bg-background border-border text-text-muted hover:border-primary/40 hover:text-text'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Intensity — only when filter active */}
            {activeFilter && (
              <div className="animate-fade-in-up">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                    Intensity
                  </p>
                  <span className="text-xs font-black text-primary">{intensity}%</span>
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
                <div className="flex justify-between text-[9px] text-text-muted mt-1 font-bold">
                  <span>None</span>
                  <span>Full</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-5 py-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl border border-border bg-background text-sm font-bold text-text-muted hover:text-text transition-all active:scale-95 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-sm shadow-primary/20 hover:opacity-90 transition-all active:scale-95 disabled:opacity-40"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…
              </>
            ) : (
              'Apply Changes'
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
