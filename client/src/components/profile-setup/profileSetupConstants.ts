// src/components/profile-setup/profileSetupConstants.ts

// 1. Remove 'type' here because these are actual React components being rendered!
import { Calendar, User, Heart, FileText, Tag, Camera, MapPin } from 'lucide-react';

// 2. Keep 'type' here because these are pure TypeScript interfaces
import type { StepConfig, Gender, SexualPreference } from '@/types/profileSetup';

export const GENDERS: Array<{
  value: Gender;
  label: string;
}> = [
  { value: 'male', label: 'Man' },
  { value: 'female', label: 'Woman' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'other', label: 'Other' },
];

export const PREFERENCES: Array<{
  value: SexualPreference;
  label: string;
}> = [
  { value: 'heterosexual', label: 'Heterosexual' },
  { value: 'homosexual', label: 'Homosexual' },
  { value: 'bisexual', label: 'Bisexual' },
];

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
  '#coffee',
  '#yoga',
  '#cinema',
  '#reading',
  '#dancing',
];

export const STEPS: StepConfig[] = [
  {
    title: 'When were you born?',
    subtitle: 'Age & birthdate',
    icon: Calendar,
    skippable: false,
  },
  {
    title: "What's your gender?",
    subtitle: 'Identity',
    icon: User,
    skippable: false,
  },
  {
    title: 'Who are you into?',
    subtitle: 'Romantic preference',
    icon: Heart,
    skippable: false,
  },
  {
    title: 'Write your bio',
    subtitle: 'About you',
    icon: FileText,
    skippable: false,
  },
  {
    title: 'Your interests',
    subtitle: 'Tags & hobbies',
    icon: Tag,
    skippable: false,
  },
  {
    title: 'Your location',
    subtitle: 'Where you are',
    icon: MapPin,
    skippable: false,
  },
  {
    title: 'Add your photos',
    subtitle: 'Show yourself',
    icon: Camera,
    skippable: false,
  },
];

// Number of floating hearts in background animation
export const FLOATING_HEARTS_COUNT = 16;

// Max photos allowed
export const MAX_PHOTOS = 5;

// Bio max length
export const BIO_MAX_LENGTH = 500;
