// src/components/profile-setup/steps/Step0Birthdate.tsx
import type { ProfileFormData } from '../../../types/profileSetup';
import { calculateAge, getMinBirthdateInput, getMaxBirthdateInput } from '../../../utils/age';
import DatePicker from '@/components/DatePicker';

interface Step0BirthdateProps {
  form: ProfileFormData;
  setForm: React.Dispatch<React.SetStateAction<ProfileFormData>>;
}

export const Step0Birthdate = ({ form, setForm }: Step0BirthdateProps) => {
  const age = calculateAge(form.birthdate);
  const maxStr = getMaxBirthdateInput();
  const minStr = getMinBirthdateInput();
  const maxDate = new Date(maxStr);
  const minDate = new Date(minStr);

  const parseDateString = (s: string): Date | null => {
    if (!s) return null;
    const parts = s.split('-');
    if (parts.length !== 3) return null;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
    return new Date(y, m, d);
  };

  return (
    <div className="w-full">
      <p className="text-xs sm:text-sm text-text-muted mb-5 sm:mb-6 italic">
        You must be at least 18 years old. Your age will be visible on your profile.
      </p>

      <label className="block text-xs sm:text-sm font-semibold text-text-muted uppercase tracking-[0.08em] mb-2 sm:mb-3">
        Date of birth
      </label>

      <DatePicker
        value={parseDateString(form.birthdate)}
        onChange={(date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          setForm((p) => ({ ...p, birthdate: `${year}-${month}-${day}` }));
        }}
        minDate={minDate}
        maxDate={maxDate}
        className={`
          flex items-center gap-2 w-full px-4 py-3 sm:py-4 rounded-xl border-2 text-text text-sm sm:text-base outline-none text-left bg-surface transition-all duration-200 cursor-pointer
          ${
            form.birthdate
              ? 'border-primary shadow-md shadow-primary/20'
              : 'border-border focus:border-primary/50'
          }
        `}
      />

      {form.birthdate && age !== null && age >= 18 && (
        <div className="mt-4 p-3 sm:p-4 bg-primary/10 rounded-2xl border border-primary/20 flex items-center justify-center animate-fade-in-up">
          <p className="text-xs sm:text-sm text-primary font-semibold">
            You are <strong>{age}</strong> years old
          </p>
        </div>
      )}

      {form.birthdate && age !== null && age < 18 && (
        <p className="mt-3 text-xs sm:text-sm font-medium text-error animate-fade-in-up">
          You must be at least 18 to use Matcha.
        </p>
      )}
    </div>
  );
};
