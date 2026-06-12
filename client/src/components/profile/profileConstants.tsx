// src/components/profile/profileConstants.ts

export const SUGGESTED_TAGS = [
  '#vegan',
  '#geek',
  '#piercing',
  '#fitness',
  '#travel',
  '#music',
  '#art',
  '#gaming',
  '#hiking',
  '#foodie',
  '#cinema',
  '#yoga',
  '#cooking',
  '#reading',
  '#photography',
];

export const GENDERS = [
  { value: 'male', label: 'Man' },
  { value: 'female', label: 'Woman' },
  { value: 'non_binary', label: 'Non-binary' },
  { value: 'other', label: 'Other' },
];

export const PREFERENCES = [
  { value: 'heterosexual', label: 'Heterosexual' },
  { value: 'homosexual', label: 'Homosexual' },
  { value: 'bisexual', label: 'Bisexual' },
];

export const DEFAULT_PREFERENCE = 'bisexual';

export function timeAgo(iso: string): string {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
