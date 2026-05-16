import { useState } from 'react';
import { Edit2, X } from 'lucide-react';
import { Section, SaveBar, inputCls, labelCls } from '../ui';
import { api } from "../../../../api/MyProfileApi";
import { SUGGESTED_TAGS } from '../../types';
import type { UserProfile } from '../../types';

interface TagsSectionProps {
  user: UserProfile;
  onUpdate: (u: UserProfile) => void;
}

export function TagsSection({ user, onUpdate }: TagsSectionProps) {
  const [editing, setEditing] = useState(false);
  const [tags, setTags]       = useState<string[]>(user.tags ?? []);
  const [input, setInput]     = useState('');
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const addTag = (tag: string) => {
    const n = tag.startsWith('#') ? tag.toLowerCase() : `#${tag.toLowerCase()}`;
    if (!n || n === '#' || tags.includes(n) || n.length < 2) return;
    setTags((t) => [...t, n]);
    setInput('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const t = await api.updateTags(tags);
      onUpdate({ ...user, tags: t });
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setTags(user.tags ?? []);
    setInput('');
    setError('');
    setEditing(false);
  };

  const availableSuggestions = SUGGESTED_TAGS.filter((t) => !tags.includes(t));

  return (
    <Section
      label="Interests"
      badge={
        <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-(--color-primary)/10 text-(--color-primary) border border-(--color-primary)/20">
          {(user.tags ?? []).length} tags
        </span>
      }
    >
      <div className="p-5">
        <div className="flex justify-between items-center mb-4">
          <p className="text-xs text-(--color-text-muted)">
            Tags used for matching — e.g. #vegan, #geek, #piercing
          </p>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 text-xs font-semibold text-(--color-primary) hover:opacity-70 transition-opacity"
            >
              <Edit2 size={11} /> Edit
            </button>
          )}
        </div>

        {editing ? (
          <div>
            <div className="flex gap-2 mb-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addTag(input.trim());
                  }
                }}
                placeholder="Type a tag and press Enter (e.g. #sport)"
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => addTag(input.trim())}
                className="px-3 py-2 rounded-xl bg-(--color-primary) text-white text-xs font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                Add
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-(--color-primary) text-white text-xs font-medium"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => setTags((t) => t.filter((x) => x !== tag))}
                      className="opacity-70 hover:opacity-100"
                    >
                      <X size={9} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {availableSuggestions.length > 0 && (
              <>
                <p className={labelCls + ' mb-2'}>Quick add</p>
                <div className="flex flex-wrap gap-1.5">
                  {availableSuggestions.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      className="px-2.5 py-1 rounded-full border border-(--color-border) text-(--color-text-muted) text-xs hover:border-(--color-primary) hover:text-(--color-primary) transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </>
            )}

            <SaveBar saving={saving} error={error} onSave={handleSave} onCancel={handleCancel} />
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {(user.tags ?? []).length > 0 ? (
              user.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-(--color-primary)/10 text-(--color-primary) text-xs font-medium border border-(--color-primary)/20"
                >
                  {tag}
                </span>
              ))
            ) : (
              <p className="text-xs text-(--color-text-muted)/50 italic">
                No interests added yet. Tags improve your match suggestions.
              </p>
            )}
          </div>
        )}
      </div>
    </Section>
  );
}
