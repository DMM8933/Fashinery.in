/**
 * Fashinery Customer Validation Utilities
 * Strict validation for Indian Mobile Numbers and Optional Email addresses.
 */

export interface MobileValidationResult {
  isValid: boolean;
  cleanPhone: string;
  error?: string;
}

export interface EmailValidationResult {
  isValid: boolean;
  cleanEmail: string;
  error?: string;
}

export interface PasswordValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates an Indian mobile number according to TRAI telecom standards:
 * - Exactly 10 digits
 * - Starts with 6, 7, 8, or 9
 * - Automatically cleans spaces, hyphens, and +91 / 91 / 0 prefixes
 */
export function validateIndianMobile(phone: string): MobileValidationResult {
  if (!phone || typeof phone !== 'string' || !phone.trim()) {
    return {
      isValid: false,
      cleanPhone: '',
      error: 'Mobile number is required.',
    };
  }

  // Strip all non-digit characters except leading plus if any
  let cleaned = phone.trim().replace(/[\s\-\(\)\.]/g, '');

  // Handle +91 or 91 country codes
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.slice(3);
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.slice(1);
  }

  // Must now consist purely of numeric digits
  if (!/^\d+$/.test(cleaned)) {
    return {
      isValid: false,
      cleanPhone: cleaned,
      error: 'Mobile number must contain only numeric digits.',
    };
  }

  // Must be exactly 10 digits
  if (cleaned.length !== 10) {
    return {
      isValid: false,
      cleanPhone: cleaned,
      error: `Mobile number must be exactly 10 digits (currently ${cleaned.length} digits).`,
    };
  }

  // In India, all valid mobile numbers begin with 6, 7, 8, or 9
  const firstDigit = cleaned[0];
  if (!['6', '7', '8', '9'].includes(firstDigit)) {
    return {
      isValid: false,
      cleanPhone: cleaned,
      error: `Invalid Indian mobile number. Mobile numbers must begin with 6, 7, 8, or 9 (starts with '${firstDigit}').`,
    };
  }

  return {
    isValid: true,
    cleanPhone: cleaned,
  };
}

/**
 * Validates an optional email address.
 * Empty string is valid since email is optional for customers.
 * If provided, must match standard email format.
 */
export function validateOptionalEmail(email?: string): EmailValidationResult {
  if (!email || !email.trim()) {
    return {
      isValid: true,
      cleanEmail: '',
    };
  }

  const clean = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(clean)) {
    return {
      isValid: false,
      cleanEmail: clean,
      error: 'Please provide a valid email format (e.g. name@example.com).',
    };
  }

  return {
    isValid: true,
    cleanEmail: clean,
  };
}

/**
 * Validates a strictly REQUIRED email address for Customer Registration
 * and Password Reset requests.
 */
export function validateRequiredEmail(email?: string): EmailValidationResult {
  if (!email || !email.trim()) {
    return {
      isValid: false,
      cleanEmail: '',
      error: 'Email address is required for account security and recovery.',
    };
  }

  const clean = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(clean)) {
    return {
      isValid: false,
      cleanEmail: clean,
      error: 'Please enter a valid email format (e.g. yourname@example.com).',
    };
  }

  return {
    isValid: true,
    cleanEmail: clean,
  };
}

export interface PasswordPolicyCheck {
  minLength: boolean; // >= 8 chars
  hasUpper: boolean;  // >= 1 uppercase
  hasLower: boolean;  // >= 1 lowercase
  hasNumber: boolean; // >= 1 number
  hasSpecial: boolean;// >= 1 special character
  matchesConfirm: boolean;
  isValid: boolean;   // minLength && hasUpper && hasLower && hasNumber && matchesConfirm
  strength: 'weak' | 'fair' | 'strong' | 'very-strong';
}

/**
 * Checks detailed password policy rules for UI checklist indicators
 */
export function checkPasswordPolicy(password: string, confirmPassword?: string): PasswordPolicyCheck {
  const minLength = (password || '').length >= 8;
  const hasUpper = /[A-Z]/.test(password || '');
  const hasLower = /[a-z]/.test(password || '');
  const hasNumber = /[0-9]/.test(password || '');
  const hasSpecial = /[^A-Za-z0-9]/.test(password || '');
  const matchesConfirm = confirmPassword !== undefined ? Boolean(password && password === confirmPassword) : true;

  // Basic required policy is 8+ chars, 1 uppercase, 1 lowercase, 1 number
  const isValid = minLength && hasUpper && hasLower && hasNumber && matchesConfirm;

  // Strength score: 0 to 5
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (hasUpper && hasLower) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;

  let strength: 'weak' | 'fair' | 'strong' | 'very-strong' = 'weak';
  if (score >= 4) strength = 'very-strong';
  else if (score >= 3) strength = 'strong';
  else if (score >= 2) strength = 'fair';

  return {
    minLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
    matchesConfirm,
    isValid,
    strength,
  };
}

/**
 * Validates password requirements strictly adhering to Fashinery production security policy:
 * - Password required
 * - Minimum 8 characters
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one number (0-9)
 * - If confirmPassword is provided, must match exactly
 */
export function validatePassword(
  password: string,
  confirmPassword?: string
): PasswordValidationResult {
  if (!password) {
    return {
      isValid: false,
      error: 'Password is required.',
    };
  }

  const policy = checkPasswordPolicy(password, confirmPassword);

  if (!policy.minLength) {
    return {
      isValid: false,
      error: 'Password must be at least 8 characters long.',
    };
  }

  if (!policy.hasUpper) {
    return {
      isValid: false,
      error: 'Password must contain at least one uppercase letter (A-Z).',
    };
  }

  if (!policy.hasLower) {
    return {
      isValid: false,
      error: 'Password must contain at least one lowercase letter (a-z).',
    };
  }

  if (!policy.hasNumber) {
    return {
      isValid: false,
      error: 'Password must contain at least one numeric digit (0-9).',
    };
  }

  if (confirmPassword !== undefined && !policy.matchesConfirm) {
    return {
      isValid: false,
      error: 'Passwords do not match. Please re-enter your confirm password.',
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Validates a URL for safety in production environments.
 * Rejects javascript:, data:, vbscript: to prevent XSS.
 * Only allows http: and https: protocols for external links.
 */
export function validateSafeURL(url?: string): { isValid: boolean; error?: string } {
  if (!url || !url.trim()) return { isValid: true };
  const clean = url.trim().toLowerCase();

  if (clean.startsWith('javascript:') || clean.startsWith('data:') || clean.startsWith('vbscript:')) {
    return {
      isValid: false,
      error: 'Unsafe URL protocol detected. Only http:// and https:// are allowed.',
    };
  }

  // Check if it's a valid URL format if it looks like an absolute link
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    try {
      new URL(url);
    } catch {
      return { isValid: false, error: 'Invalid URL format.' };
    }
  }

  return { isValid: true };
}

/**
 * Masks an email for privacy display during password reset (e.g. a***a@gmail.com)
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `${local[0]}*@${domain}`;
  }
  return `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
}
