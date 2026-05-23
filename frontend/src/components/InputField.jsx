/**
 * InputField.jsx
 * ===============
 * A reusable input component that handles:
 *   - Dynamic border colors (green for valid, red/orange for invalid)
 *   - Inline error messages, tooltip-style errors, or warning icons
 *   - Success tick icon for valid fields
 *   - Shake animation class toggling
 *   - Password visibility toggle
 *
 * Props:
 *   label        – The field label text
 *   type         – Input type (text, password, number)
 *   id           – Unique id for the input
 *   name         – Form field name (matches state key)
 *   value        – Current value from state
 *   onChange     – onChange handler
 *   placeholder  – Placeholder text
 *   error        – Error message string (empty = no error)
 *   touched      – Whether the field has been interacted with
 *   errorStyle   – 'inline' | 'tooltip' | 'icon' — controls how errors display
 *   shaking      – Boolean to trigger shake animation
 *   children     – Optional extra content (e.g., password strength bar)
 */
import { useState } from 'react';

function InputField({
  label,
  type = 'text',
  id,
  name,
  value,
  onChange,
  placeholder,
  error,
  touched,
  errorStyle = 'inline',
  shaking = false,
  children,
}) {
  // State management: track whether to show/hide password text
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === 'password';

  // Conditional rendering: determine input border class based on validation state
  // - No class if field hasn't been touched yet
  // - 'input-error' (red) for inline errors, 'input-warning' (orange) for icon-style
  // - 'input-valid' (green) if touched and no error
  const getInputClass = () => {
    if (!touched) return '';
    if (error) {
      return errorStyle === 'icon' ? 'input-warning' : 'input-error';
    }
    return 'input-valid';
  };

  return (
    <div className={`form-field ${shaking ? 'shake' : ''}`}>
      <label htmlFor={id}>{label}</label>

      {/* Input wrapper holds the input + any icons (tick, warning, eye toggle) */}
      <div className="input-wrapper">
        <input
          type={isPasswordType && showPassword ? 'text' : type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={getInputClass()}
        />

        {/* Conditional rendering: show success tick when field is valid and touched */}
        {touched && !error && (
          <span className="field-icon tick-icon" title="Valid">✓</span>
        )}

        {/* Conditional rendering: show warning icon for email-style errors */}
        {touched && error && errorStyle === 'icon' && (
          <span className="field-icon warning-icon" title={error}>⚠</span>
        )}

        {/* Password visibility toggle button */}
        {isPasswordType && (
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? '🙈' : '👁'}
          </button>
        )}
      </div>

      {/* Conditional rendering: inline red error message (for name, password, confirm) */}
      {touched && error && errorStyle === 'inline' && (
        <span className="error-message">{error}</span>
      )}

      {/* Conditional rendering: tooltip-style error (for age field) */}
      {touched && error && errorStyle === 'tooltip' && (
        <div className="tooltip-error">
          <span className="tooltip-arrow"></span>
          {error}
        </div>
      )}

      {/* Slot for extra content like password strength indicator */}
      {children}
    </div>
  );
}

export default InputField;
