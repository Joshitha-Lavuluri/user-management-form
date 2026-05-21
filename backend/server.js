const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Database Configuration
const DB_HOST = 'localhost';
const DB_USER = 'root';
const DB_PASSWORD = 'joshi2005';
const DB_NAME = 'usermanagement';
const DB_PORT = 3306;

// Create MySQL Pool
const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Use promise-based pool for async/await
const promisePool = pool.promise();

// Test Database Connection
pool.getConnection((err, connection) => {
  if (err) {
    console.log("Database Connection Error");
    console.log(err);
  } else {
    console.log("MySQL Connected Successfully");
    connection.release();
  }
});

// ── Ensure the 'users' table exists ──────────────────────────────────────────
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    age INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;
pool.query(createTableQuery, (err) => {
  if (err) console.error('Error creating users table:', err);
  else console.log('Users table ready');
});

// ── CRUD Routes ──────────────────────────────────────────────────────────────

// GET all users
app.get('/users', async (req, res) => {
  try {
    const [rows] = await promisePool.query('SELECT * FROM users ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST a new user
app.post('/users', async (req, res) => {
  try {
    const { name, email, age } = req.body;
    if (!name || !email || !age) {
      return res.status(400).json({ error: 'Name, email, and age are required' });
    }
    const [result] = await promisePool.query(
      'INSERT INTO users (name, email, age) VALUES (?, ?, ?)',
      [name, email, Number(age)]
    );
    res.status(201).json({ id: result.insertId, name, email, age: Number(age) });
  } catch (error) {
    console.error('Error adding user:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'A user with this email already exists' });
    }
    res.status(500).json({ error: 'Failed to add user' });
  }
});

// PUT (update) a user
app.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, age } = req.body;
    if (!name || !email || !age) {
      return res.status(400).json({ error: 'Name, email, and age are required' });
    }
    const [result] = await promisePool.query(
      'UPDATE users SET name = ?, email = ?, age = ? WHERE id = ?',
      [name, email, Number(age), id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ id: Number(id), name, email, age: Number(age) });
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'A user with this email already exists' });
    }
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE a user
app.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await promisePool.query('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});