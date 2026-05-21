import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001';

function App() {
  const initialForm = { name: '', email: '', age: '' };
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editUserId, setEditUserId] = useState(null);
  const [message, setMessage] = useState('');

  // Fetch users when the app loads
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      setUsers(response.data);
    } catch (error) {
      setMessage('Error loading users. Please try again.');
      console.error(error);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name || !formData.email || !formData.age) {
      setMessage('Please fill in all fields before submitting.');
      return;
    }

    if (editUserId) {
      await updateUser(editUserId, formData);
    } else {
      await addUser(formData);
    }

    setFormData(initialForm);
    setEditUserId(null);
  };

  const addUser = async (user) => {
    try {
      await axios.post(`${API_BASE_URL}/users`, {
        name: user.name,
        email: user.email,
        age: Number(user.age),
      });
      setMessage('User added successfully!');
      fetchUsers();
    } catch (error) {
      setMessage('Error adding user. Please try again.');
      console.error(error);
    }
  };

  const updateUser = async (id, user) => {
    try {
      await axios.put(`${API_BASE_URL}/users/${id}`, {
        name: user.name,
        email: user.email,
        age: Number(user.age),
      });
      setMessage('User updated successfully!');
      fetchUsers();
    } catch (error) {
      setMessage('Error updating user. Please try again.');
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

  const startEdit = (user) => {
    setEditUserId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      age: user.age.toString(),
    });
    setMessage('Editing user. Make changes and click Save.');
  };

  const cancelEdit = () => {
    setEditUserId(null);
    setFormData(initialForm);
    setMessage('Edit cancelled.');
  };

  return (
    <div className="app-container">
      <header>
        <h1>User Management System</h1>
        <p>Add, edit, or remove users using React, Axios, and Express.</p>
      </header>

      {message && <div className="message">{message}</div>}

      <section className="form-section">
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter name"
            />
          </div>

          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email"
            />
          </div>

          <div className="form-field">
            <label htmlFor="age">Age</label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              placeholder="Enter age"
            />
          </div>

          <div className="button-row">
            <button type="submit" className="primary-button">
              {editUserId ? 'Save Changes' : 'Add User'}
            </button>
            {editUserId && (
              <button type="button" className="secondary-button" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

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
                      <button className="edit-button" onClick={() => startEdit(user)}>
                        Edit
                      </button>
                      <button className="delete-button" onClick={() => deleteUser(user.id)}>
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
    </div>
  );
}

export default App;
