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
 * Validate step 1 (gender) - optional but if provided, must be valid
 */
export const validateGenderStep = (_gender: string): StepValidation => {
  void _gender;
  return { valid: true, message: '' };
};

/**
 * Validate step 2 (preference) - optional but if provided, must be valid
 */
export const validatePreferenceStep = (_preference: string): StepValidation => {
  void _preference;
  return { valid: true, message: '' };
};

/**
 * Validate step 3 (bio) - optional
 */
export const validateBioStep = (_biography: string): StepValidation => {
  void _biography;
  return { valid: true, message: '' };
};

/**
 * Validate step 4 (tags) - optional
 */
export const validateTagsStep = (_tags: string[]): StepValidation => {
  void _tags;
  return { valid: true, message: '' };
};

/**
 * Validate step 5 (location) - optional
 */
export const validateLocationStep = (
  _city: string,
  _latitude: number | null,
  _longitude: number | null,
): StepValidation => {
  void _city;
  void _latitude;
  void _longitude;
  return { valid: true, message: '' };
};

/**
 * Validate step 6 (photos) - optional
 */
export const validatePhotosStep = (_photos: File[]): StepValidation => {
  void _photos;
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
