import type { ProfileFormData, StepValidation } from '../types/profileSetup';
import { calculateAge } from './age';

/**
 * Validate step 0 (birthdate)
 */
export const validateBirthdateStep = (birthdate: string): StepValidation => {
  if (!birthdate) {
    return {
      valid: false,
      message: 'Please enter your date of birth.',
    };
  }

  const age = calculateAge(birthdate);
  if (age === null || age < 18) {
    return {
      valid: false,
      message: 'You must be at least 18 years old.',
    };
  }

  return { valid: true, message: '' };
};

/**
 * Validate step 1 (gender) - required
 */
export const validateGenderStep = (gender: string): StepValidation => {
  if (!gender) {
    return {
      valid: false,
      message: 'Please select your gender identity.',
    };
  }
  return { valid: true, message: '' };
};

/**
 * Validate step 2 (preference) - required
 */
export const validatePreferenceStep = (preference: string): StepValidation => {
  if (!preference) {
    return {
      valid: false,
      message: 'Please select your romantic orientation.',
    };
  }
  return { valid: true, message: '' };
};

/**
 * Validate step 3 (bio) - required
 */
export const validateBioStep = (biography: string): StepValidation => {
  if (!biography || !biography.trim()) {
    return {
      valid: false,
      message: 'Please write a short biography about yourself.',
    };
  }
  return { valid: true, message: '' };
};

/**
 * Validate step 4 (tags) - required
 */
export const validateTagsStep = (tags: string[]): StepValidation => {
  if (!tags || tags.length === 0) {
    return {
      valid: false,
      message: 'Please select or add at least one interest.',
    };
  }
  return { valid: true, message: '' };
};

/**
 * Validate step 5 (location) - required
 */
export const validateLocationStep = (
  city: string,
  latitude: number | null,
  longitude: number | null,
): StepValidation => {
  void city;
  if (latitude === null || longitude === null) {
    return {
      valid: false,
      message: 'Please set your location using your GPS.',
    };
  }
  return { valid: true, message: '' };
};

/**
 * Validate step 6 (photos) - required
 */
export const validatePhotosStep = (photos: File[]): StepValidation => {
  if (!photos || photos.length === 0) {
    return {
      valid: false,
      message: 'Please upload at least one photo.',
    };
  }
  return { valid: true, message: '' };
};

/**
 * Main validation dispatcher - validates the current step based on step number
 */
export const validateStep = (stepIndex: number, form: ProfileFormData): StepValidation => {
  switch (stepIndex) {
    case 0:
      return validateBirthdateStep(form.birthdate);
    case 1:
      return validateGenderStep(form.gender);
    case 2:
      return validatePreferenceStep(form.sexual_preference);
    case 3:
      return validateBioStep(form.biography);
    case 4:
      return validateTagsStep(form.tags);
    case 5:
      return validateLocationStep(form.location_city, form.latitude, form.longitude);
    case 6:
      return validatePhotosStep(form.photos);
    default:
      return { valid: true, message: '' };
  }
};
