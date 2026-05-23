/**
 * App.jsx — Main Application Component
 * ======================================
 * This is the root functional component for the User Management System.
 *
 * STATE MANAGEMENT (useState):
 *   - formData:      Stores current values for all input fields
 *   - errors:        Stores validation error messages for each field
 *   - touched:       Tracks which fields the user has interacted with
 *   - shakingField:  Which field is currently playing the shake animation
 *   - showModal:     Controls visibility of the success modal
 *   - submittedData: Snapshot of data at submission time (shown in modal)
 *   - users:         Array of users fetched from the backend
 *   - editUserId:    ID of user being edited (null = adding new)
 *   - message:       Status message displayed below the header
 *
 * EVENT HANDLING:
 *   - handleInputChange: Fires on every keystroke (onChange), updates state
 *     and runs real-time validation for the changed field
 *   - handleSubmit:      Validates all fields, sends data to backend, shows modal
 *   - handleReset:       Clears form, errors, and touched state
 *
 * HOOKS:
 *   - useState:  For all state variables
 *   - useEffect: To fetch users on mount, auto-close modal after 3 seconds,
 *                and trigger email popup alerts
 */
import { useState, useEffect } from 'react';
import axios from 'axios';

// Import separated validation functions
import {
  validateName,
  validateEmail,
  validateAge,
  validatePassword,
  validateConfirmPassword,
  getPasswordStrength,
} from './utils/validators';

// Import reusable components
import InputField from './components/InputField';
import PasswordStrength from './components/PasswordStrength';
import SuccessModal from './components/SuccessModal';

const API_BASE_URL = 'http://localhost:5001';

function App() {
  // ─── Initial state shapes ────────────────────────────────────────
  const initialForm = {
    name: '',
    email: '',
    age: '',
    password: '',
    confirmPassword: '',
  };
  const initialErrors = {
    name: '',
    email: '',
    age: '',
    password: '',
    confirmPassword: '',
  };
  const initialTouched = {
    name: false,
    email: false,
    age: false,
    password: false,
    confirmPassword: false,
  };

  // ─── State declarations (useState hook) ──────────────────────────
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState(initialErrors);
  const [touched, setTouched] = useState(initialTouched);
  const [shakingField, setShakingField] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [users, setUsers] = useState([]);
  const [editUserId, setEditUserId] = useState(null);
  const [message, setMessage] = useState('');

  // ─── useEffect: Fetch users from backend on component mount ──────
  useEffect(() => {
    fetchUsers();
  }, []);

  // ─── useEffect: Auto-close success modal after 3 seconds ─────────
  // When showModal becomes true, a timer starts. After 3s the modal
  // closes and the form resets automatically.
  useEffect(() => {
    if (showModal) {
      const timer = setTimeout(() => {
        setShowModal(false);
        setSubmittedData(null);
        setFormData(initialForm);
        setErrors(initialErrors);
        setTouched(initialTouched);
        setEditUserId(null);
      }, 3000);
      // Cleanup: clear timer if modal is closed manually before 3s
      return () => clearTimeout(timer);
    }
  }, [showModal]);

  // ─── useEffect: Show popup alert for invalid email ────────────────
  // When the email error changes and is non-empty, trigger a browser alert.
  // This runs only when the user has touched the email field.
  useEffect(() => {
    if (touched.email && errors.email && formData.email.trim()) {
      // Small delay so the UI updates before the blocking alert appears
      const timer = setTimeout(() => {
        alert(`⚠️ Email Validation Error: ${errors.email}`);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [errors.email]);

  // ─── useEffect: Trigger shake animation for age field ─────────────
  // When age has an error while touched, trigger a shake. The animation
  // class is removed after 600ms so it can re-trigger on the next change.
  useEffect(() => {
    if (touched.age && errors.age && formData.age.trim()) {
      setShakingField('age');
      const timer = setTimeout(() => setShakingField(''), 600);
      return () => clearTimeout(timer);
    }
  }, [errors.age]);

  // ─── Backend API calls ────────────────────────────────────────────
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      // New backend returns { success, count, data: [...] }
      setUsers(response.data.data || response.data);
    } catch (error) {
      setMessage('Error loading users. Please try again.');
      console.error(error);
    }
  };

  const addUser = async (user) => {
    try {
      // POST to /register endpoint with password included
      await axios.post(`${API_BASE_URL}/register`, {
        name: user.name,
        email: user.email,
        age: Number(user.age),
        password: user.password,
      });
      setMessage('User registered successfully!');
      fetchUsers();
    } catch (error) {
      // Show the specific backend error message if available
      const errMsg = error.response?.data?.message || error.response?.data?.errors?.[0] || 'Error registering user.';
      setMessage(errMsg);
      console.error(error);
    }
  };

  const updateUser = async (id, user) => {
    try {
      await axios.put(`${API_BASE_URL}/users/${id}`, {
        name: user.name,
        email: user.email,
        age: Number(user.age),
        // Only send password if user entered a new one
        ...(user.password ? { password: user.password } : {}),
      });
      setMessage('User updated successfully!');
      fetchUsers();
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Error updating user.';
      setMessage(errMsg);
      console.error(error);
    }
  };

  const deleteUser = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/users/${id}`);
      setMessage('User deleted successfully!');
      fetchUsers();
    } catch (error) {
      setMessage('Error deleting user. Please try again.');
      console.error(error);
    }
  };

  // ─── Validate a single field by name ──────────────────────────────
  // Called during onChange for real-time validation
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return validateName(value);
      case 'email':
        return validateEmail(value);
      case 'age':
        return validateAge(value);
      case 'password':
        return validatePassword(value);
      case 'confirmPassword':
        return validateConfirmPassword(value, formData.password);
      default:
        return '';
    }
  };

  // ─── onChange Event Handler ───────────────────────────────────────
  // Fires on every keystroke. Updates formData, marks field as touched,
  // and runs real-time validation for immediate feedback.
  const handleInputChange = (event) => {
    const { name, value } = event.target;

    // Update the form data state
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Mark field as touched (user has interacted with it)
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Run real-time validation and update errors state
    const errorMsg = value ? validateField(name, value) : '';
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));

    // Special case: if password changes, re-validate confirmPassword
    // to keep the "Passwords do not match" message in sync
    if (name === 'password' && formData.confirmPassword) {
      const confirmErr = validateConfirmPassword(formData.confirmPassword, value);
      setErrors((prev) => ({ ...prev, confirmPassword: confirmErr }));
    }
  };

  // ─── Validate All Fields ──────────────────────────────────────────
  // Called on form submit to ensure every field passes validation.
  // Returns true only if all fields are valid.
  const validateAllFields = () => {
    const newErrors = {
      name: validateName(formData.name),
      email: validateEmail(formData.email),
      age: validateAge(formData.age),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(
        formData.confirmPassword,
        formData.password
      ),
    };

    setErrors(newErrors);
    // Mark all fields as touched so errors become visible
    setTouched({
      name: true,
      email: true,
      age: true,
      password: true,
      confirmPassword: true,
    });

    // Form is valid only if every error string is empty
    return Object.values(newErrors).every((err) => err === '');
  };

  // ─── Submit Handler ───────────────────────────────────────────────
  // Prevents default form submission, validates all fields,
  // sends data to backend, and shows success modal.
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateAllFields()) return;

    // Save submitted data for the success modal display
    setSubmittedData({ ...formData });

    // Send to backend (only name, email, age are stored)
    if (editUserId) {
      await updateUser(editUserId, formData);
    } else {
      await addUser(formData);
    }

    // Show the success modal (form auto-resets after 3 seconds via useEffect)
    setShowModal(true);
  };

  // ─── Reset Handler ────────────────────────────────────────────────
  // Clears all form state back to initial values
  const handleReset = () => {
    setFormData(initialForm);
    setErrors(initialErrors);
    setTouched(initialTouched);
    setEditUserId(null);
    setMessage('');
    setShakingField('');
  };

  // ─── Edit / Cancel Handlers ───────────────────────────────────────
  const startEdit = (user) => {
    setEditUserId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      age: user.age.toString(),
      password: '',
      confirmPassword: '',
    });
    setErrors(initialErrors);
    setTouched(initialTouched);
    setMessage('Editing user. Make changes and click Save.');
  };

  const cancelEdit = () => {
    setEditUserId(null);
    setFormData(initialForm);
    setErrors(initialErrors);
    setTouched(initialTouched);
    setMessage('Edit cancelled.');
  };

  // ─── Computed values ──────────────────────────────────────────────
  // Password strength object for the strength indicator
  const passwordStrength = getPasswordStrength(formData.password);

  // Disable submit button until all fields are filled and error-free
  const isFormValid =
    Object.values(formData).every((v) => v.trim() !== '') &&
    Object.values(errors).every((e) => e === '');

  // ─── RENDER ───────────────────────────────────────────────────────
  return (
    <div className="app-container">
      <header>
        <h1>User Management System</h1>
        <p>Add, edit, or remove users using React, Axios, and Express.</p>
      </header>

      {/* Conditional rendering: show status messages */}
      {message && <div className="message">{message}</div>}

      {/* ─── FORM CARD ─────────────────────────────────────────── */}
      <section className="form-section">
        <h2 className="form-title">
          {editUserId ? '✏️ Edit User' : '➕ Add New User'}
        </h2>

        <form onSubmit={handleSubmit} noValidate>
          {/* NAME — inline red error, red border when empty */}
          <InputField
            label="Name"
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            error={errors.name}
            touched={touched.name}
            errorStyle="inline"
          />

          {/* EMAIL — warning icon, orange border, popup alert */}
          <InputField
            label="Email"
            type="text"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="example@email.com"
            error={errors.email}
            touched={touched.email}
            errorStyle="icon"
          />

          {/* AGE — tooltip error, shake animation */}
          <InputField
            label="Age"
            type="text"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            placeholder="Enter your age (18–60)"
            error={errors.age}
            touched={touched.age}
            errorStyle="tooltip"
            shaking={shakingField === 'age'}
          />

          {/* PASSWORD — inline error + strength indicator */}
          <InputField
            label="Password"
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Min 8 chars, upper, lower, number, symbol"
            error={errors.password}
            touched={touched.password}
            errorStyle="inline"
          >
            {/* Password strength bar rendered inside the InputField slot */}
            <PasswordStrength strength={passwordStrength} />
          </InputField>

          {/* CONFIRM PASSWORD — inline error */}
          <InputField
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Re-enter your password"
            error={errors.confirmPassword}
            touched={touched.confirmPassword}
            errorStyle="inline"
          />

          {/* ─── BUTTON ROW ──────────────────────────────────── */}
          <div className="button-row">
            <button
              type="submit"
              className="primary-button"
              disabled={!isFormValid}
            >
              {editUserId ? '💾 Save Changes' : '✅ Submit'}
            </button>
            <button
              type="button"
              className="reset-button"
              onClick={handleReset}
            >
              🔄 Reset
            </button>
            {editUserId && (
              <button
                type="button"
                className="secondary-button"
                onClick={cancelEdit}
              >
                ✖ Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {/* ─── USERS TABLE ───────────────────────────────────────── */}
      <section className="table-section">
        <h2>All Users</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Age</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5">No users found. Add a user to get started.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.age}</td>
                    <td>
                      <button
                        className="edit-button"
                        onClick={() => startEdit(user)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => deleteUser(user.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Conditional rendering: Success modal */}
      {showModal && submittedData && (
        <SuccessModal
          data={submittedData}
          onClose={() => {
            setShowModal(false);
            setSubmittedData(null);
            setFormData(initialForm);
            setErrors(initialErrors);
            setTouched(initialTouched);
            setEditUserId(null);
          }}
        />
      )}
    </div>
  );
}

export default App;
