// src/components/profile-setup/profileSetupConstants.ts

// 1. Remove 'type' here because these are actual React components being rendered!
import {
  Calendar,
  User,
  Heart,
  FileText,
  Tag,
  Camera,
} from 'lucide-react';

// 2. Keep 'type' here because these are pure TypeScript interfaces
import type { StepConfig, Gender, SexualPreference } from '@/types/profileSetup';

export const GENDERS: Array<{
  value: Gender;
  label: string;
  emoji: string;
}> = [
  { value: 'male', label: 'Man', emoji: '👨' },
  { value: 'female', label: 'Woman', emoji: '👩' },
  { value: 'non-binary', label: 'Non-binary', emoji: '🧑' },
  { value: 'other', label: 'Other', emoji: '✨' },
];

export const PREFERENCES: Array<{
  value: SexualPreference;
  label: string;
  emoji: string;
}> = [
  { value: 'heterosexual', label: 'Heterosexual', emoji: '👫' },
  { value: 'homosexual', label: 'Homosexual', emoji: '👬' },
  { value: 'bisexual', label: 'Bisexual', emoji: '🌈' },
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
    skippable: true,
  },
  {
    title: 'Who are you into?',
    subtitle: 'Romantic preference',
    icon: Heart,
    skippable: true,
  },
  {
    title: 'Write your bio',
    subtitle: 'About you',
    icon: FileText,
    skippable: true,
  },
  {
    title: 'Your interests',
    subtitle: 'Tags & hobbies',
    icon: Tag,
    skippable: true,
  },
  {
    title: 'Your location',
    subtitle: 'Where you are',
    icon: Camera, // Consider changing this to MapPin
    skippable: true,
  },
  {
    title: 'Add your photos',
    subtitle: 'Show yourself',
    icon: Camera,
    skippable: true,
  },
];

// Number of floating hearts in background animation
export const FLOATING_HEARTS_COUNT = 16;

// Max photos allowed
export const MAX_PHOTOS = 5;

// Bio max length
export const BIO_MAX_LENGTH = 500;
