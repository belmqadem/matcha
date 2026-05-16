import { useState } from 'react';
import { Edit2, Shield } from 'lucide-react';
import { Section, SaveBar, inputCls, labelCls } from '../ui';
import { api } from "../../../../api/MyProfileApi";
import type { UserProfile } from '../../types';

interface BasicInfoSectionProps {
  user: UserProfile;
  onUpdate: (u: UserProfile) => void;
}

export function BasicInfoSection({ user, onUpdate }: BasicInfoSectionProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    first_name: user.first_name,
    last_name:  user.last_name,
    username:   user.username,
    email:      user.email,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const handleSave = async () => {
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError('First and last name are required.');
      return;
    }
    if (!form.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const u = await api.patchUser(form);
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
      first_name: user.first_name,
      last_name:  user.last_name,
      username:   user.username,
      email:      user.email,
    });
    setError('');
    setEditing(false);
  };

  return (
    <Section label="Identity">
      <div className="p-5">
        <div className="flex justify-between items-center mb-4">
          <p className="text-xs text-(--color-text-muted)">Name, username & email</p>
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
            <div className="grid grid-cols-2 gap-3">
              {(['first_name', 'last_name'] as const).map((f) => (
                <div key={f}>
                  <label className={labelCls}>
                    {f === 'first_name' ? 'First name' : 'Last name'}
                  </label>
                  <input
                    value={form[f]}
                    onChange={(e) => setForm((p) => ({ ...p, [f]: e.target.value }))}
                    className={inputCls}
                  />
                </div>
              ))}
            </div>
            <div>
              <label className={labelCls}>Username</label>
              <input
                value={form.username}
                onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Email address</label>
              <input
                value={form.email}
                type="email"
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className={inputCls}
              />
              <p className="text-[10px] text-(--color-text-muted)/50 mt-1 flex items-center gap-1">
                <Shield size={9} /> Changing your email will require re-verification.
              </p>
            </div>
            <SaveBar saving={saving} error={error} onSave={handleSave} onCancel={handleCancel} />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'First name', value: user.first_name },
                { label: 'Last name',  value: user.last_name },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className={labelCls}>{label}</p>
                  <p className="text-sm font-medium text-(--color-text)">{value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className={labelCls}>Username</p>
              <p className="text-sm font-medium text-(--color-text)">@{user.username}</p>
            </div>
            <div>
              <p className={labelCls}>Email address</p>
              <p className="text-sm text-(--color-text-muted)">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}
