// src/components/profile-setup/steps/Step3Bio.tsx
import type { ProfileFormData } from '../../../types/profileSetup';
import { BIO_MAX_LENGTH } from '../profileSetupConstants';

interface Step3BioProps {
  form: ProfileFormData;
  setForm: React.Dispatch<React.SetStateAction<ProfileFormData>>;
}

export const Step3Bio = ({ form, setForm }: Step3BioProps) => {
  return (
    <div className="w-full">
      <p className="text-xs sm:text-sm text-text-muted mb-4 italic">
        Tell others a little about yourself. What makes you, you?
      </p>

      <textarea
        value={form.biography}
        onChange={(e) => setForm((p) => ({ ...p, biography: e.target.value }))}
        placeholder="I love hiking on weekends, experimenting with new recipes, and finding hidden gem coffee shops..."
        maxLength={BIO_MAX_LENGTH}
        rows={5}
        className={`
          w-full px-4 py-3 sm:py-4 rounded-xl border-2 resize-none outline-none
          text-sm sm:text-base text-text transition-all duration-200 leading-relaxed
          scrollbar-thin
          ${
            form.biography
              ? 'border-primary bg-surface shadow-md shadow-primary/20'
              : 'border-border bg-surface focus:border-primary/50'
          }
        `}
      />

      {/* <div className="flex justify-between items-center mt-3 gap-3">
        <div className="h-1 sm:h-1.5 rounded-full bg-border flex-1 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary opacity-60 transition-all duration-200"
            style={{ width: `${(form.biography.length / BIO_MAX_LENGTH) * 100}%` }}
          />
        </div>
        <span className="text-xs sm:text-sm text-text-muted flex-shrink-0 font-medium">
          {form.biography.length} / {BIO_MAX_LENGTH}
        </span>
      </div> */}
    </div>
  );
};
