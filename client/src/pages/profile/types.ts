export interface Photo {
  id: number;
  url: string;
  order_index: number;
  created_at: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  age: number | null;
  gender: string | null;
  sexual_preference: string | null;
  biography: string | null;
  location_city: string | null;
  latitude: number | null;
  longitude: number | null;
  fame_rating: number;
  tags: string[];
  photos: Photo[];
  profile_picture_id: number | null;
  is_online?: boolean;
  last_seen?: string | null;
}

export interface Visitor {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture_url: string | null;
  visited_at: string;
}

export interface Liker {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture_url: string | null;
  liked_at: string;
}

export const SECTION_TABS = [
  { key: 'photos',    label: 'Photos',         icon: 'Camera' },
  { key: 'identity',  label: 'Identity',        icon: 'User' },
  { key: 'about',     label: 'About',           icon: 'Info' },
  { key: 'interests', label: 'Interests',       icon: 'Tag' },
  { key: 'location',  label: 'Location',        icon: 'MapPin' },
  { key: 'activity',  label: 'Fame & Activity', icon: 'Star' },
] as const;

export type SectionKey = (typeof SECTION_TABS)[number]['key'];

export const SUGGESTED_TAGS = [
  '#vegan', '#geek', '#piercing', '#fitness', '#travel',
  '#music', '#art', '#gaming', '#hiking', '#foodie',
  '#cinema', '#yoga', '#cooking', '#reading', '#photography',
];

export const GENDERS = [
  { value: 'male',       label: 'Man' },
  { value: 'female',     label: 'Woman' },
  { value: 'non_binary', label: 'Non-binary' },
  { value: 'other',      label: 'Other' },
];

export const PREFERENCES = [
  { value: 'heterosexual', label: 'Heterosexual' },
  { value: 'homosexual',   label: 'Homosexual' },
  { value: 'bisexual',     label: 'Bisexual' },
];

export const DEFAULT_PREFERENCE = 'bisexual';
