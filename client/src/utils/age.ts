/**
 * Calculate age from ISO 8601 birthdate string
 * Returns null if date is invalid
 */
export const calculateAge = (birthdate: string): number | null => {
  if (!birthdate) return null;

  const birth = new Date(birthdate);
  if (isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birth.getDate())
  ) {
    age--;
  }

  return age;
};

/**
 * Get max date for input (18 years ago)
 */
export const getMaxBirthdateInput = (): string => {
  const today = new Date();
  const maxDate = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate()
  );
  return maxDate.toISOString().split('T')[0];
};

/**
 * Get min date for input (100 years ago)
 */
export const getMinBirthdateInput = (): string => {
  const today = new Date();
  const minDate = new Date(
    today.getFullYear() - 100,
    today.getMonth(),
    today.getDate()
  );
  return minDate.toISOString().split('T')[0];
};
