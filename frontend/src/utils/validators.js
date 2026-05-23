/**
 * validators.js
 * ==============
 * Contains all validation logic for the User Management Form.
 * Each validator returns an error string if invalid, or an empty string if valid.
 * Keeping validators separate makes them reusable and testable.
 */

// ─── NAME VALIDATION ────────────────────────────────────────────────
// Rules:
//   1. Cannot be empty
//   2. Must contain only letters and spaces (no numbers or symbols)
//   3. Minimum 3 characters
export const validateName = (name) => {
  if (!name.trim()) return 'Name is required';
  if (!/^[a-zA-Z\s]+$/.test(name)) return 'Name should contain only letters';
  if (name.trim().length < 3) return 'Name must be at least 3 characters';
  return '';
};

// ─── EMAIL VALIDATION ───────────────────────────────────────────────
// Rules:
//   1. Cannot be empty
//   2. Must match standard email format (something@domain.tld)
//   Uses a regex pattern: one or more non-whitespace/@ chars, @, domain, ., extension
export const validateEmail = (email) => {
  if (!email.trim()) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid Email';
  return '';
};

// ─── AGE VALIDATION ─────────────────────────────────────────────────
// Rules:
//   1. Cannot be empty
//   2. Must contain only digits (no letters or symbols)
//   3. Must be between 18 and 60 (inclusive)
export const validateAge = (age) => {
  const str = age.toString().trim();
  if (!str) return 'Age is required';
  if (!/^\d+$/.test(str)) return 'Age must be a number';
  const num = Number(str);
  if (num < 18 || num > 60) return 'Age must be between 18 and 60';
  return '';
};

// ─── PASSWORD VALIDATION ────────────────────────────────────────────
// Rules:
//   1. Cannot be empty
//   2. Minimum 8 characters
//   3. Must contain at least one uppercase letter
//   4. Must contain at least one lowercase letter
//   5. Must contain at least one digit
//   6. Must contain at least one special character (!@#$%^&* etc.)
export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Must contain an uppercase letter';
  if (!/[a-z]/.test(password)) return 'Must contain a lowercase letter';
  if (!/[0-9]/.test(password)) return 'Must contain a number';
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password))
    return 'Must contain a special character';
  return '';
};

// ─── CONFIRM PASSWORD VALIDATION ────────────────────────────────────
// Rules:
//   1. Cannot be empty
//   2. Must exactly match the password field
export const validateConfirmPassword = (confirmPassword, password) => {
  if (!confirmPassword) return 'Please confirm your password';
  if (confirmPassword !== password) return 'Passwords do not match';
  return '';
};

// ─── PASSWORD STRENGTH CALCULATOR ───────────────────────────────────
// Returns an object with { level, score, label } for the strength indicator.
// Scoring:
//   +1 for length >= 8
//   +1 for uppercase letter
//   +1 for lowercase letter
//   +1 for digit
//   +1 for special character
//   +1 for length >= 12 (bonus for long passwords)
export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, level: 'none', label: '' };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score++;

  // Map score ranges to strength levels
  if (score <= 2) return { score, level: 'weak', label: 'Weak' };
  if (score <= 4) return { score, level: 'medium', label: 'Medium' };
  return { score, level: 'strong', label: 'Strong' };
};
