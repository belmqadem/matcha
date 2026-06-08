import type { ProfileFormData } from '../../../types/profileSetup';
import { GENDERS } from '../profileSetupConstants';
import { OptionButton } from '../../ui/OptionButton';

interface Step1GenderProps {
  form: ProfileFormData;
  setForm: React.Dispatch<React.SetStateAction<ProfileFormData>>;
}

export const Step1Gender = ({ form, setForm }: Step1GenderProps) => {
  return (
    <div className="flex flex-col gap-2.25">
      <p className="text-xs text-text-muted mb-1 italic">
        Select the option that best describes you.
      </p>

      {GENDERS.map(({ value, label, emoji }) => (
        <OptionButton
          key={value}
          label={`${emoji}  ${label}`}
          selected={form.gender === value}
          onClick={() => setForm((p) => ({ ...p, gender: value }))}
        />
      ))}
    </div>
  );
};
