import { useState } from 'react';
import { Edit2, ChevronDown, Info } from 'lucide-react';
import { Section, SaveBar, inputCls, labelCls } from '../ui';
import { api } from "../../../../api/MyProfileApi";
import { GENDERS, PREFERENCES, DEFAULT_PREFERENCE } from '../../types';
import type { UserProfile } from '../../types';

interface AboutSectionProps {
  user: UserProfile;
  onUpdate: (u: UserProfile) => void;
}

export function AboutSection({ user, onUpdate }: AboutSectionProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    gender:            user.gender ?? '',
    sexual_preference: user.sexual_preference ?? '',
    biography:         user.biography ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const u = await api.patchProfile(form);
      onUpdate(u);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      gender:            user.gender ?? '',
      sexual_preference: user.sexual_preference ?? '',
      biography:         user.biography ?? '',
    });
    setError('');
    setEditing(false);
  };

  const genderLabel = GENDERS.find((g) => g.value === user.gender)?.label;
  const prefLabel   = PREFERENCES.find((p) => p.value === user.sexual_preference)?.label;
  const displayPref =
    prefLabel ??
    `${PREFERENCES.find((p) => p.value === DEFAULT_PREFERENCE)?.label} (default)`;

  return (
    <Section label="About you">
      <div className="p-5">
        <div className="flex justify-between items-center mb-4">
          <p className="text-xs text-(--color-text-muted)">Gender, orientation & bio</p>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 text-xs font-semibold text-(--color-primary) hover:opacity-70 transition-opacity"
            >
              <Edit2 size={11} /> Edit
            </button>
          )}
        </div>

        {editing ? (
          <div className="space-y-3">
            {[
              { label: 'Gender',             key: 'gender'            as const, opts: GENDERS      },
              { label: 'Sexual orientation', key: 'sexual_preference' as const, opts: PREFERENCES  },
            ].map(({ label, key, opts }) => (
              <div key={key}>
                <label className={labelCls}>{label}</label>
                <div className="relative">
                  <select
                    value={form[key]}
                    onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                    className={inputCls + ' appearance-none pr-8'}
                  >
                    <option value="">Not specified</option>
                    {opts.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <ChevronDown
                    size={12}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-text-muted) pointer-events-none"
                  />
                </div>
              </div>
            ))}

            {!form.sexual_preference && (
              <p className="text-[10px] text-amber-600 flex items-center gap-1 -mt-1">
                <Info size={9} /> If left unspecified, you will be considered bisexual by default.
              </p>
            )}

            <div>
              <label className={labelCls}>Biography</label>
              <textarea
                value={form.biography}
                onChange={(e) => setForm((p) => ({ ...p, biography: e.target.value }))}
                maxLength={500}
                rows={4}
                className={inputCls + ' resize-none'}
                placeholder="Tell others who you are…"
              />
              <p className="text-right text-[10px] text-(--color-text-muted)/50 mt-1">
                {form.biography.length}/500
              </p>
            </div>

            <SaveBar saving={saving} error={error} onSave={handleSave} onCancel={handleCancel} />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              {genderLabel && (
                <span className="px-3 py-1 rounded-full bg-(--color-background) text-(--color-text) text-xs font-medium border border-(--color-border)">
                  {genderLabel}
                </span>
              )}
              <span className="px-3 py-1 rounded-full bg-(--color-primary)/10 text-(--color-primary) text-xs font-medium border border-(--color-primary)/20">
                {displayPref}
              </span>
            </div>
            {user.biography ? (
              <p className="text-sm text-(--color-text-muted) leading-relaxed">{user.biography}</p>
            ) : (
              <p className="text-xs text-(--color-text-muted)/50 italic">No biography written yet.</p>
            )}
          </div>
        )}
      </div>
    </Section>
  );
}
