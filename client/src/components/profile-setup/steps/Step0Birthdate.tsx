// src/components/profile-setup/steps/Step0Birthdate.tsx
import type { ProfileFormData } from '../../../types/profileSetup';
import { calculateAge, getMinBirthdateInput, getMaxBirthdateInput } from '../../../utils/age';

interface Step0BirthdateProps {
  form: ProfileFormData;
  setForm: React.Dispatch<React.SetStateAction<ProfileFormData>>;
}

export const Step0Birthdate = ({ form, setForm }: Step0BirthdateProps) => {
  const age = calculateAge(form.birthdate);
  const maxDate = getMaxBirthdateInput();
  const minDate = getMinBirthdateInput();

  return (
    <div className="w-full">
      <p className="text-xs sm:text-sm text-text-muted mb-5 sm:mb-6 italic">
        You must be at least 18 years old. Your age will be visible on your profile.
      </p>

      <label className="block text-xs sm:text-sm font-semibold text-text-muted uppercase tracking-[0.08em] mb-2 sm:mb-3">
        Date of birth
      </label>

      <input
        type="date"
        autoComplete="new-birthdate"
        value={form.birthdate}
        onChange={(e) => setForm((p) => ({ ...p, birthdate: e.target.value }))}
        min={minDate}
        max={maxDate}
        className={`
          w-full px-4 py-3 sm:py-4 rounded-xl border-2 text-text text-sm sm:text-base outline-none
          transition-all duration-200
          ${
            form.birthdate
              ? 'border-primary bg-surface shadow-md shadow-primary/20'
              : 'border-border bg-surface focus:border-primary/50'
          }
        `}
      />

      {form.birthdate && age !== null && age >= 18 && (
        <div className="mt-4 p-3 sm:p-4 bg-primary/10 rounded-2xl border border-primary/20 flex items-center gap-3 animate-fade-in-up">
          <span className="text-lg sm:text-xl">🎂</span>
          <p className="text-sm sm:text-base text-primary font-semibold">
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
