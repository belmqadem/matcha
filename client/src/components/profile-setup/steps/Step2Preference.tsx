import type { ProfileFormData } from '../../../types/profileSetup';
import { PREFERENCES } from '../profileSetupConstants';
import { OptionButton } from '../../ui/OptionButton';

interface Step2PreferenceProps {
  form: ProfileFormData;
  setForm: React.Dispatch<React.SetStateAction<ProfileFormData>>;
}

export const Step2Preference = ({ form, setForm }: Step2PreferenceProps) => {
  return (
    <div className="flex flex-col gap-2.25">
      <p className="text-xs text-text-muted mb-1 italic">
        Who are you interested in meeting?
      </p>

      {PREFERENCES.map(({ value, label, emoji }) => (
        <OptionButton
          key={value}
          label={`${emoji}  ${label}`}
          selected={form.sexual_preference === value}
          onClick={() =>
            setForm((p) => ({ ...p, sexual_preference: value }))
          }
        />
      ))}
    </div>
  );
};
