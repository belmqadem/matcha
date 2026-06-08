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
    const normalized = tag.startsWith('#')
      ? tag.toLowerCase()
      : `#${tag.toLowerCase()}`;
    if (!normalized || normalized === '#' || form.tags.includes(normalized))
      return;
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
    <div>
      <p className="text-xs text-text-muted mb-3.5 italic">
        Add interests so others can find you. Press Enter or comma to add.
      </p>

      {/* Input + Add button */}
      <div className="flex gap-2 mb-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="#vegan, #geek…"
          className="flex-1 px-4 py-3 rounded-[14px] border-[1.5px] border-border bg-white text-sm transition-all duration-200"
        />
        <button
          type="button"
          onClick={() => addTag(input.trim())}
          className="px-4 py-3 rounded-[14px] bg-primary text-white text-sm font-semibold flex-shrink-0 transition-all duration-200 hover:shadow-md hover:shadow-primary/35"
        >
          Add
        </button>
      </div>

      {/* Added tags */}
      {form.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.75 mb-3.5">
          {form.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 px-2.75 py-1.25 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20 animate-popIn"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="bg-none border-none cursor-pointer p-0 flex text-primary opacity-60 hover:opacity-100 transition-opacity"
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Suggestions */}
      <p className="text-xs text-text-muted uppercase tracking-[0.06em] mb-2 font-semibold">
        Suggestions
      </p>
      <div className="flex flex-wrap gap-1.5">
        {SUGGESTED_TAGS.filter((t) => !form.tags.includes(t)).map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => addTag(tag)}
            className={`
              px-2.75 py-1.25 rounded-full border-[1.5px] border-border bg-white
              text-text-muted text-xs font-medium cursor-pointer
              transition-all duration-150
              hover:border-primary hover:text-primary hover:bg-primary/6
            `}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};
