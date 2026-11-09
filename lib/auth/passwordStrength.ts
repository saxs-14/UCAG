/**
 * UCAG's own minimum, checked client-side before ever calling Firebase --
 * Firebase Auth's own floor is just 6 characters with no complexity rule,
 * which isn't enough on its own. Kept intentionally simple (4 checks, no
 * external library) since this only needs to run once, on submit.
 */
export const MIN_PASSWORD_LENGTH = 8;

const SPECIAL_CHAR_PATTERN = /[^A-Za-z0-9]/;

export function passwordRequirementError(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must include at least one capital letter.";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must include at least one number.";
  }
  if (!SPECIAL_CHAR_PATTERN.test(password)) {
    return "Password must include at least one special character (e.g. ! @ # $ %).";
  }
  return null;
}
