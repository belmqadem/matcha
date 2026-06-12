// src/components/profile/EditAboutModal.tsx
import { useState } from 'react';
import { ChevronDown, Info } from 'lucide-react';
import { userService } from '@/services/userService';
import type { UserProfile } from '@/types/user';
import { GENDERS, PREFERENCES } from './profileConstants';
import { EditModal } from './EditModal';
import { SaveBar } from './SaveBar';

const inputCls =
  'w-full bg-background border-2 border-transparent rounded-2xl px-4 py-3 sm:py-3.5 text-sm sm:text-base font-bold text-text placeholder-text-muted outline-none focus:border-primary transition-all';
const labelCls = 'block text-[0.65rem] sm:text-xs font-bold tracking-widest uppercase text-text-muted mb-2';

interface Props {
  user: UserProfile;
  onUpdate: (u: UserProfile) => void;
  onClose: () => void;
}

export function EditAboutModal({ user, onUpdate, onClose }: Props) {
  const [form, setForm] = useState({
    gender: user.gender ?? '',
    sexual_preference: user.sexual_preference ?? '',
    biography: user.biography ?? '',
    age: user.birth_date
      ? String(new Date().getFullYear() - new Date(user.birth_date).getFullYear())
      : '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!form.age || parseInt(form.age) < 18) {
      setError('You must be at least 18.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const birthDate = new Date(new Date().getFullYear() - parseInt(form.age), 0, 1)
        .toISOString()
        .split('T')[0];

      const updated = await userService.patchProfile({
        gender: form.gender || undefined,
        sexual_preference: form.sexual_preference || undefined,
        biography: form.biography || undefined,
        birth_date: birthDate,
      } as Partial<UserProfile>);

      onUpdate(updated);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <EditModal title="Edit About" onClose={onClose}>
      <div className="flex flex-col gap-4 sm:gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Age</label>
            <input
              value={form.age}
              type="number"
              min={18}
              max={99}
              onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
              className={inputCls}
              placeholder="Your age"
            />
          </div>
          <div>
            <label className={labelCls}>Gender</label>
            <div className="relative">
              <select
                value={form.gender}
                onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
                className={`${inputCls} appearance-none pr-10 cursor-pointer`}
              >
                <option value="">Not specified</option>
                {GENDERS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            </div>
          </div>
        </div>

        <div>
          <label className={labelCls}>Sexual orientation</label>
          <div className="relative">
            <select
              value={form.sexual_preference}
              onChange={(e) => setForm((p) => ({ ...p, sexual_preference: e.target.value }))}
              className={`${inputCls} appearance-none pr-10 cursor-pointer`}
            >
              <option value="">Not specified (defaults to bisexual)</option>
              {PREFERENCES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          </div>
          {!form.sexual_preference && (
            <p className="text-[0.65rem] sm:text-xs font-bold text-primary/80 mt-2 flex items-center gap-1.5 animate-fade-in-up">
              <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Will default to bisexual.
            </p>
          )}
        </div>

        <div>
          <label className={labelCls}>Biography</label>
          <textarea
            value={form.biography}
            onChange={(e) => setForm((p) => ({ ...p, biography: e.target.value }))}
            maxLength={500}
            rows={4}
            placeholder="Tell others who you are…"
            className={`${inputCls} resize-none scrollbar-thin`}
          />
          <p className="text-right text-[0.65rem] sm:text-xs font-bold text-text-muted mt-1.5">
            {form.biography.length}/500
          </p>
        </div>

        <SaveBar saving={saving} error={error} onSave={handleSave} onCancel={onClose} />
      </div>
    </EditModal>
  );
}
