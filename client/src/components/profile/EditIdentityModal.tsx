// src/components/profile/EditIdentityModal.tsx
import { useState } from 'react';
import { Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userService } from '@/services/userService';
import { authService } from '@/services/authService';
import type { UserProfile } from '@/types/user';
import { EditModal } from './EditModal';
import { SaveBar } from './SaveBar';

const inputCls = 'w-full bg-background border-2 border-transparent rounded-2xl px-4 py-3 sm:py-3.5 text-sm sm:text-base font-bold text-text placeholder-text-muted outline-none focus:border-primary transition-all';
const labelCls = 'block text-[0.65rem] sm:text-xs font-bold tracking-widest uppercase text-text-muted mb-2';

interface Props {
  user: UserProfile;
  onUpdate: (u: UserProfile) => void;
  onClose: () => void;
}

export function EditIdentityModal({ user, onUpdate, onClose }: Props) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: user.first_name,
    last_name:  user.last_name,
    username:   user.username,
    email:      user.email,
  });

  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const handleSave = async () => {
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError('Name is required.');
      return;
    }
    const emailChanged = form.email !== user.email;

    if (emailChanged) {
      const ok = window.confirm(
        'Changing your email will sign you out. You will need to verify your new email before logging back in. Continue?',
      );
      if (!ok) return;
    }

    setSaving(true);
    setError('');

    try {
      const updated = await userService.patchUser(form);
      if (emailChanged) {
        await authService.logout();
        navigate('/login');
        return;
      }
      onUpdate(updated);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <EditModal title="Edit Identity" onClose={onClose}>
      <div className="flex flex-col gap-4 sm:gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(['first_name', 'last_name'] as const).map(f => (
            <div key={f}>
              <label className={labelCls}>{f === 'first_name' ? 'First name' : 'Last name'}</label>
              <input
                value={form[f]}
                onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))}
                className={inputCls}
              />
            </div>
          ))}
        </div>

        <div>
          <label className={labelCls}>Username</label>
          <input
            value={form.username}
            onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Email</label>
          <input
            value={form.email}
            type="email"
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            className={inputCls}
          />
          <p className="text-[0.65rem] sm:text-xs font-bold text-error/80 mt-2 flex items-center gap-1.5 animate-fade-in-up">
            <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Changing your email requires re-verification.
          </p>
        </div>

        <SaveBar saving={saving} error={error} onSave={handleSave} onCancel={onClose} />
      </div>
    </EditModal>
  );
}
