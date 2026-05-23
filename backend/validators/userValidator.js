/**
 * validators/userValidator.js — Reusable Validation Functions
 * =============================================================
 *
 * VALIDATION LOGIC EXPLAINED:
 * ───────────────────────────
 * Each function checks ONE specific rule and returns an error message
 * string if invalid, or null if valid.
 *
 * validateRegistration() runs ALL validations at once and collects
 * any errors into an array. If the array is empty, the data is valid.
 *
 * These validators run on the SERVER side (backend) as a second layer
 * of protection. Even if someone bypasses the frontend, the backend
 * will still reject invalid data.
 */

// ─── Validate Name ──────────────────────────────────────────────────
// Rules:
//   - Cannot be empty or whitespace-only
//   - Must contain only letters and spaces (no numbers/symbols)
//   - Minimum 3 characters
const validateName = (name) => {
  if (!name || !name.trim()) return 'Name is required';
  if (!/^[a-zA-Z\s]+$/.test(name)) return 'Name should contain only letters';
  if (name.trim().length < 3) return 'Name must be at least 3 characters';
  return null; // null means valid
};

// ─── Validate Email ─────────────────────────────────────────────────
// Rules:
//   - Cannot be empty
//   - Must match standard email format: something@domain.extension
//   - Regex breakdown:
//       [^\s@]+  → one or more chars that aren't spaces or @
//       @        → literal @ symbol
//       [^\s@]+  → domain name
//       \.       → literal dot
//       [^\s@]+  → extension (com, org, etc.)
const validateEmail = (email) => {
  if (!email || !email.trim()) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Invalid email format';
  return null;
};

// ─── Validate Age ───────────────────────────────────────────────────
// Rules:
//   - Cannot be empty
//   - Must be a valid number (not NaN, not a string with letters)
//   - Must be an integer (no decimals)
//   - Must be between 18 and 60 (inclusive)
const validateAge = (age) => {
  if (age === undefined || age === null || age === '') return 'Age is required';

  // Convert to number and check if it's valid
  const numAge = Number(age);
  if (isNaN(numAge)) return 'Age must be a valid number';
  if (!Number.isInteger(numAge)) return 'Age must be a whole number';
  if (numAge < 18 || numAge > 60) return 'Age must be between 18 and 60';
  return null;
};

// ─── Validate Password ─────────────────────────────────────────────
// Rules:
//   - Cannot be empty
//   - Minimum 8 characters long
//   - Must contain at least one uppercase letter (A-Z)
//   - Must contain at least one lowercase letter (a-z)
//   - Must contain at least one digit (0-9)
//   - Must contain at least one special character (!@#$%^&* etc.)
const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain a number';
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password))
    return 'Password must contain a special character';
  return null;
};

// ─── Validate All Registration Fields ───────────────────────────────
// Runs all validators and returns { isValid, errors }
// errors is an array of error message strings (empty if valid)
const validateRegistration = (data) => {
  const errors = [];

  // Run each validator; if it returns a string, add to errors array
  const nameError = validateName(data.name);
  if (nameError) errors.push(nameError);

  const emailError = validateEmail(data.email);
  if (emailError) errors.push(emailError);

  const ageError = validateAge(data.age);
  if (ageError) errors.push(ageError);

  const passwordError = validatePassword(data.password);
  if (passwordError) errors.push(passwordError);

  return {
    isValid: errors.length === 0, // true if no errors
    errors,                       // array of error messages
  };
};

// ─── Validate Update Fields (password optional) ─────────────────────
// When updating a user, password is optional (they may not want to change it).
const validateUpdate = (data) => {
  const errors = [];

  const nameError = validateName(data.name);
  if (nameError) errors.push(nameError);

  const emailError = validateEmail(data.email);
  if (emailError) errors.push(emailError);

  const ageError = validateAge(data.age);
  if (ageError) errors.push(ageError);

  // Only validate password if one is provided
  if (data.password) {
    const passwordError = validatePassword(data.password);
    if (passwordError) errors.push(passwordError);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ─── Validate an Existing Database Record ───────────────────────────
// DATABASE VALIDATION LOGIC EXPLAINED:
// ────────────────────────────────────
// When fetching users from the database, the backend re-checks each
// stored record against the same validation rules. This catches:
//   - Records inserted directly via MySQL Workbench (bypassing the API)
//   - Records from before validation rules were added
//   - Records corrupted by direct SQL UPDATE statements
//
// HOW VALIDATION HAPPENS DURING FETCHING:
//   1. All users are fetched from the database (SELECT * FROM users)
//   2. Each user record is passed to validateDatabaseRecord()
//   3. The function checks name, email, and age against the rules
//   4. Returns { status: "VALID" } or { status: "INVALID", reasons: [...] }
//   5. The status and reasons are attached to each user in the response
//
// Note: We don't validate password here because passwords are stored
// as bcrypt hashes in the DB — we can't validate the original password.
const validateDatabaseRecord = (user) => {
  const reasons = [];

  // Re-validate name from stored record
  const nameError = validateName(user.name);
  if (nameError) reasons.push(nameError);

  // Re-validate email from stored record
  const emailError = validateEmail(user.email);
  if (emailError) reasons.push(emailError);

  // Re-validate age from stored record
  const ageError = validateAge(user.age);
  if (ageError) reasons.push(ageError);

  // Classify as VALID or INVALID based on whether any errors were found
  if (reasons.length === 0) {
    return { status: 'VALID', reasons: [] };
  } else {
    return { status: 'INVALID', reasons };
  }
};

// Export all validators for use in middleware and controllers
module.exports = {
  validateName,
  validateEmail,
  validateAge,
  validatePassword,
  validateRegistration,
  validateUpdate,
  validateDatabaseRecord,
};
