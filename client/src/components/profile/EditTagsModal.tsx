// src/components/profile/EditTagsModal.tsx
import { useState } from 'react';
import { X } from 'lucide-react';
import { userService } from '@/services/userService';
import type { UserProfile } from '@/types/user';
import { SUGGESTED_TAGS } from './profileConstants';
import { EditModal } from './EditModal';
import { SaveBar } from './SaveBar';

const inputCls =
  'w-full bg-background border-2 border-transparent rounded-2xl px-4 py-3 sm:py-3.5 text-sm sm:text-base font-bold text-text placeholder-text-muted outline-none focus:border-primary transition-all';
const labelCls =
  'block text-[0.65rem] sm:text-xs font-bold tracking-widest uppercase text-text-muted mb-2';

interface Props {
  user: UserProfile;
  onUpdate: (_u: UserProfile) => void;
  onClose: () => void;
}

export function EditTagsModal({ user, onUpdate, onClose }: Props) {
  const [tags, setTags] = useState<string[]>(user.tags ?? []);
  const [input, setInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const addTag = (tag: string) => {
    const n = tag.startsWith('#') ? tag.toLowerCase() : `#${tag.toLowerCase()}`;
    if (!n || n === '#' || tags.includes(n) || n.length < 2) return;
    setTags((t) => [...t, n]);
    setInput('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const updated = await userService.updateTags(tags);
      onUpdate({ ...user, tags: updated });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const available = SUGGESTED_TAGS.filter((t) => !tags.includes(t));

  return (
    <EditModal title="Edit Interests" onClose={onClose}>
      <div className="flex flex-col gap-4 sm:gap-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                addTag(input.trim());
              }
            }}
            placeholder="#sport, #music…"
            className={inputCls}
          />
          <button
            type="button"
            onClick={() => addTag(input.trim())}
            className="px-6 py-3 sm:py-3.5 rounded-2xl bg-primary text-surface font-bold cursor-pointer hover:shadow-md active:scale-95 transition-all"
          >
            Add
          </button>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-surface text-xs sm:text-sm font-bold shadow-sm animate-fade-in-up"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => setTags((t) => t.filter((x) => x !== tag))}
                  className="bg-surface/20 rounded-full p-0.5 hover:bg-surface/40 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        {available.length > 0 && (
          <div>
            <p className={labelCls}>Quick add</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {available.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag)}
                  className="px-3 py-1.5 rounded-full border-2 border-border bg-surface text-text-muted text-xs sm:text-sm font-bold cursor-pointer hover:border-primary hover:text-primary transition-all active:scale-95"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        <SaveBar saving={saving} error={error} onSave={handleSave} onCancel={onClose} />
      </div>
    </EditModal>
  );
}
