/**
 * SuccessModal.jsx
 * =================
 * A modal overlay that appears on successful form submission.
 * Displays:
 *   - Animated checkmark icon
 *   - "Form Submitted Successfully" heading
 *   - Summary of entered user data
 *   - Countdown message (auto-closes in 3 seconds)
 *
 * Props:
 *   data    – The submitted form data object { name, email, age, ... }
 *   onClose – Callback to close the modal manually
 */

function SuccessModal({ data, onClose }) {
  return (
    // Overlay covers the entire viewport with a semi-transparent backdrop
    <div className="modal-overlay" onClick={onClose}>
      {/* Modal card — stopPropagation prevents closing when clicking inside */}
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>

        {/* Animated success checkmark */}
        <div className="modal-icon">✓</div>

        <h2 className="modal-title">Form Submitted Successfully!</h2>

        {/* Display the submitted user data in a clean table */}
        <div className="modal-data">
          <div className="modal-row">
            <span className="modal-label">Name:</span>
            <span className="modal-value">{data.name}</span>
          </div>
          <div className="modal-row">
            <span className="modal-label">Email:</span>
            <span className="modal-value">{data.email}</span>
          </div>
          <div className="modal-row">
            <span className="modal-label">Age:</span>
            <span className="modal-value">{data.age}</span>
          </div>
        </div>

        <p className="modal-countdown">Form will reset automatically in 3 seconds...</p>

        <button className="modal-close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default SuccessModal;
