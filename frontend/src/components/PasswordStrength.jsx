/**
 * PasswordStrength.jsx
 * =====================
 * Displays a visual password strength indicator with three levels:
 *   - Weak   (red bar, ~33% width)
 *   - Medium (orange bar, ~66% width)
 *   - Strong (green bar, 100% width)
 *
 * Props:
 *   strength – Object from getPasswordStrength() with { level, label, score }
 *
 * The component only renders when a password has been entered (level !== 'none').
 */

function PasswordStrength({ strength }) {
  // Conditional rendering: don't show anything if no password entered
  if (!strength || strength.level === 'none') return null;

  return (
    <div className="password-strength">
      {/* The animated bar that fills based on strength level */}
      <div className="strength-bar">
        <div className={`strength-fill strength-${strength.level}`}></div>
      </div>

      {/* Text label indicating strength level */}
      <span className={`strength-label strength-text-${strength.level}`}>
        {strength.label}
      </span>
    </div>
  );
}

export default PasswordStrength;
