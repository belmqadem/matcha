// src/components/profile-setup/steps/Step4Tags.tsx
import { useState } from 'react';
import { X } from 'lucide-react';
import type { ProfileFormData } from '../../../types/profileSetup';
import { SUGGESTED_TAGS } from '../profileSetupConstants';

interface Step4TagsProps {
  form: ProfileFormData;
  setForm: React.Dispatch<React.SetStateAction<ProfileFormData>>;
}

export const Step4Tags = ({ form, setForm }: Step4TagsProps) => {
  const [input, setInput] = useState('');

  const addTag = (tag: string) => {
    const normalized = tag.startsWith('#') ? tag.toLowerCase() : `#${tag.toLowerCase()}`;
    if (!normalized || normalized === '#' || form.tags.includes(normalized)) return;
    setForm((p) => ({ ...p, tags: [...p.tags, normalized] }));
    setInput('');
  };

  const removeTag = (tag: string) => {
    setForm((p) => ({ ...p, tags: p.tags.filter((t) => t !== tag) }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input.trim());
    }
  };

  return (
    <div className="w-full">
      <p className="text-xs sm:text-sm text-text-muted mb-4 italic">
        Add interests so others can find you. Press Enter or comma to add.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="#vegan, #geek…"
          className="flex-1 px-4 py-3 sm:py-4 rounded-xl border-2 border-border bg-surface text-text text-sm sm:text-base outline-none transition-all duration-200 focus:border-primary/50"
        />
        <button
          type="button"
          onClick={() => addTag(input.trim())}
          className="px-6 py-3 sm:py-4 rounded-xl bg-primary text-surface text-sm sm:text-base font-semibold flex-shrink-0 transition-all duration-200 hover:bg-primary-hover active:scale-95"
        >
          Add
        </button>
      </div>

      {form.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {form.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-semibold border border-primary/20 animate-fade-in-up"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="flex items-center justify-center p-0.5 text-primary opacity-60 hover:opacity-100 hover:bg-primary/20 rounded-full transition-all"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </span>
          ))}
        </div>
      )}

      <p className="text-xs sm:text-sm text-text-muted uppercase tracking-wider mb-3 font-semibold">
        Suggestions
      </p>
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_TAGS.filter((t) => !form.tags.includes(t)).map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => addTag(tag)}
            className="px-3 py-1.5 rounded-full border-2 border-border bg-surface text-text-muted text-xs sm:text-sm font-medium transition-all duration-150 hover:border-primary hover:text-primary hover:bg-primary/10 active:scale-95"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};
