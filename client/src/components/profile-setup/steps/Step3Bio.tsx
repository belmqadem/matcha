import type { ProfileFormData } from '../../../types/profileSetup';
import { BIO_MAX_LENGTH } from '../profileSetupConstants';

interface Step3BioProps {
  form: ProfileFormData;
  setForm: React.Dispatch<React.SetStateAction<ProfileFormData>>;
}

export const Step3Bio = ({ form, setForm }: Step3BioProps) => {
  return (
    <div>
      <p className="text-xs text-text-muted mb-3 italic">
        Tell others a little about yourself. What makes you, you?
      </p>

      <textarea
        value={form.biography}
        onChange={(e) =>
          setForm((p) => ({ ...p, biography: e.target.value }))
        }
        placeholder="I love hiking on weekends, experimenting with new recipes, and finding hidden gem coffee shops..."
        maxLength={BIO_MAX_LENGTH}
        rows={6}
        className={`
          w-full px-4 py-3 rounded-[14px] border-[1.5px] resize-none
          transition-all duration-200 leading-relaxed
          ${
            form.biography
              ? 'border-primary bg-white shadow-md shadow-primary/14'
              : 'border-border bg-white'
          }
        `}
      />

      {/* Character counter */}
      <div className="flex justify-between items-center mt-2 gap-2.5">
        <div className="h-[3px] rounded-full bg-border flex-1 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary opacity-60 transition-all duration-200"
            style={{ width: `${(form.biography.length / BIO_MAX_LENGTH) * 100}%` }}
          />
        </div>
        <span className="text-xs text-text-muted flex-shrink-0">
          {form.biography.length}/{BIO_MAX_LENGTH}
        </span>
      </div>
    </div>
  );
};
