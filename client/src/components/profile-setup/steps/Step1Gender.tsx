// src/components/profile-setup/steps/Step1Gender.tsx
import type { ProfileFormData } from '../../../types/profileSetup';
import { GENDERS } from '../profileSetupConstants';
import { OptionButton } from '../../ui/OptionButton';

interface Step1GenderProps {
  form: ProfileFormData;
  setForm: React.Dispatch<React.SetStateAction<ProfileFormData>>;
}

export const Step1Gender = ({ form, setForm }: Step1GenderProps) => {
  return (
    <div className="flex flex-col gap-3 sm:gap-4 w-full">
      <p className="text-xs sm:text-sm text-text-muted mb-2 italic">
        Select the option that best describes you.
      </p>

      {GENDERS.map(({ value, label }) => (
        <OptionButton
          key={value}
          label={label}
          selected={form.gender === value}
          onClick={() => setForm((p) => ({ ...p, gender: value }))}
        />
      ))}
    </div>
  );
};
