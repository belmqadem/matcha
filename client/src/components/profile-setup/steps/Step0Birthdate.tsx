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
    <div>
      <p className="text-xs text-text-muted mb-5 italic">
        You must be at least 18 years old. Your age will be visible on your
        profile.
      </p>

      <label className="block text-xs font-semibold text-text-muted uppercase tracking-[0.08em] mb-2">
        Date of birth
      </label>

      <input
        type="date"
        value={form.birthdate}
        onChange={(e) =>
          setForm((p) => ({ ...p, birthdate: e.target.value }))
        }
        min={minDate}
        max={maxDate}
        className={`
          w-full px-4 py-3 rounded-[14px] border-[1.5px]
          transition-all duration-200
          ${
            form.birthdate
              ? 'border-primary bg-white shadow-md shadow-primary/14'
              : 'border-border bg-white'
          }
        `}
      />

      {/* Age confirmation */}
      {form.birthdate && age !== null && age >= 18 && (
        <div className="mt-3 p-3 bg-primary/7 rounded-3xl border border-primary/14 flex items-center gap-2 animate-fadeIn">
          <span className="text-base">🎂</span>
          <p className="text-xs text-primary font-semibold">
            You are <strong>{age}</strong> years old
          </p>
        </div>
      )}

      {/* Age warning */}
      {form.birthdate && age !== null && age < 18 && (
        <p className="mt-2 text-xs text-error">
          You must be at least 18 to use Matcha.
        </p>
      )}
    </div>
  );
};
