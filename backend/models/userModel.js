/**
 * models/userModel.js — Database Query Functions (Data Access Layer)
 * ===================================================================
 *
 * SQL QUERIES EXPLAINED:
 * ──────────────────────
 * This file contains all the SQL queries for the users table.
 * Each function performs a specific database operation:
 *
 *   - createUsersTable()  → CREATE TABLE IF NOT EXISTS
 *   - createUser()        → INSERT INTO users ...
 *   - getAllUsers()        → SELECT * FROM users
 *   - getUserById()       → SELECT * FROM users WHERE id = ?
 *   - getUserByEmail()    → SELECT * FROM users WHERE email = ?
 *   - updateUser()        → UPDATE users SET ... WHERE id = ?
 *   - deleteUser()        → DELETE FROM users WHERE id = ?
 *
 * PARAMETERIZED QUERIES (? placeholders):
 * ───────────────────────────────────────
 * We use ? placeholders instead of string concatenation to prevent
 * SQL injection attacks. mysql2 automatically escapes the values.
 *   BAD:  `SELECT * FROM users WHERE id = ${id}`  ← SQL injection risk!
 *   GOOD: `SELECT * FROM users WHERE id = ?`, [id] ← Safe!
 */

const db = require('../db');

// ─── Create Users Table ─────────────────────────────────────────────
// Called once when the server starts. Creates the table if it doesn't exist.
// SQL Constraints:
//   - id: PRIMARY KEY, AUTO_INCREMENT — unique identifier, auto-generated
//   - name: VARCHAR(100), NOT NULL — required, max 100 characters
//   - email: VARCHAR(100), NOT NULL, UNIQUE — required, no duplicates allowed
//   - age: INT, NOT NULL — required, numeric only
//   - password: VARCHAR(255), NOT NULL — stores bcrypt hash (60 chars, but 255 for safety)
//   - created_at: TIMESTAMP, DEFAULT CURRENT_TIMESTAMP — auto-set on creation
const createUsersTable = async () => {
  // Create the table with a status column to store validation classification
  //   - status: VARCHAR(10), DEFAULT 'VALID' — stores 'VALID' or 'INVALID'
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      age INT NOT NULL,
      password VARCHAR(255) NOT NULL,
      status VARCHAR(10) DEFAULT 'VALID',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  try {
    await db.query(sql);
    console.log('✅ Users table ready');

    // Migration: Add 'status' column to existing tables that don't have it yet.
    // ALTER TABLE ADD COLUMN is safe — IF NOT EXISTS prevents errors if already added.
    try {
      await db.query(`ALTER TABLE users ADD COLUMN status VARCHAR(10) DEFAULT 'VALID'`);
      console.log('✅ Status column added');
    } catch (alterErr) {
      // Error code ER_DUP_FIELDNAME means the column already exists — that's fine
      if (alterErr.code !== 'ER_DUP_FIELDNAME') {
        console.error('⚠️  Could not add status column:', alterErr.message);
      }
    }
  } catch (error) {
    console.error('❌ Error creating users table:', error.message);
  }
};

// ─── Create (Register) a New User ──────────────────────────────────
// INSERT query adds a new row to the users table.
// New users validated by middleware are stored with status = 'VALID'.
// Returns the result object containing insertId (the new user's ID).
const createUser = async (name, email, age, hashedPassword, status = 'VALID') => {
  const sql = 'INSERT INTO users (name, email, age, password, status) VALUES (?, ?, ?, ?, ?)';
  const [result] = await db.query(sql, [name, email, age, hashedPassword, status]);
  return result;
};

// ─── Get All Users ──────────────────────────────────────────────────
// SELECT query retrieves all users, ordered by newest first (DESC).
// Includes the status column. Password is excluded for security.
const getAllUsers = async () => {
  const sql = 'SELECT id, name, email, age, status, created_at FROM users ORDER BY id DESC';
  const [rows] = await db.query(sql);
  return rows;
};

// ─── Get Single User by ID ─────────────────────────────────────────
// SELECT with WHERE clause to find one specific user.
// Returns the first row (or undefined if not found).
const getUserById = async (id) => {
  const sql = 'SELECT id, name, email, age, status, created_at FROM users WHERE id = ?';
  const [rows] = await db.query(sql, [id]);
  return rows[0]; // undefined if no user found
};

// ─── Get User by Email ──────────────────────────────────────────────
// Used to check for duplicate emails before registration.
// Returns the user object if found, or undefined if not.
const getUserByEmail = async (email) => {
  const sql = 'SELECT id, email FROM users WHERE email = ?';
  const [rows] = await db.query(sql, [email]);
  return rows[0];
};

// ─── Update a User ──────────────────────────────────────────────────
// UPDATE query modifies an existing row. Uses SET to change columns.
// If password is provided, update it too; otherwise keep the old one.
const updateUser = async (id, name, email, age, hashedPassword) => {
  let sql, params;

  if (hashedPassword) {
    // Update all fields including password
    sql = 'UPDATE users SET name = ?, email = ?, age = ?, password = ? WHERE id = ?';
    params = [name, email, age, hashedPassword, id];
  } else {
    // Update without changing password
    sql = 'UPDATE users SET name = ?, email = ?, age = ? WHERE id = ?';
    params = [name, email, age, id];
  }

  const [result] = await db.query(sql, params);
  return result;
};

// ─── Delete a User ──────────────────────────────────────────────────
// DELETE query removes a row by ID.
// affectedRows tells us if a row was actually deleted (0 = user not found).
const deleteUser = async (id) => {
  const sql = 'DELETE FROM users WHERE id = ?';
  const [result] = await db.query(sql, [id]);
  return result;
};

// ─── Update User Status ─────────────────────────────────────────────
// Updates the status column for a user ('VALID' or 'INVALID').
// Called after re-validating database records.
const updateUserStatus = async (id, status) => {
  const sql = 'UPDATE users SET status = ? WHERE id = ?';
  const [result] = await db.query(sql, [status, id]);
  return result;
};

module.exports = {
  createUsersTable,
  createUser,
  getAllUsers,
  getUserById,
  getUserByEmail,
  updateUser,
  deleteUser,
  updateUserStatus,
};
