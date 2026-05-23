/**
 * server.js — Application Entry Point
 * =====================================
 *
 * HOW TO INSTALL DEPENDENCIES:
 * ────────────────────────────
 * 1. Open terminal and navigate to the backend folder:
 *      cd backend
 * 2. Run npm install:
 *      npm install
 *    This installs all packages listed in package.json:
 *      - express    → Web framework for building APIs
 *      - cors       → Allows frontend (port 5173) to call backend (port 5001)
 *      - mysql2     → MySQL database driver for Node.js
 *      - bcryptjs   → Password hashing library
 *      - nodemon    → Auto-restarts server when code changes (dev only)
 *
 * HOW TO CREATE THE DATABASE:
 * ───────────────────────────
 * 1. Open MySQL Workbench
 * 2. Connect to your local MySQL server
 * 3. Run this SQL command:
 *      CREATE DATABASE IF NOT EXISTS user_management;
 * 4. The users table is created automatically when the server starts
 *
 * HOW TO START THE SERVER:
 * ────────────────────────
 *   Development (auto-restart on changes):
 *      npm run dev
 *   Production:
 *      npm start
 *
 * HOW TO CONNECT MySQL:
 * ─────────────────────
 *   1. Make sure MySQL service is running
 *   2. Update the password in db.js to match your MySQL root password
 *   3. The connection is tested automatically on startup
 *   4. You should see "✅ MySQL Connected Successfully" in the console
 *
 * HOW TO TEST APIs IN POSTMAN:
 * ────────────────────────────
 * 1. Download and install Postman (https://www.postman.com)
 * 2. Use the following endpoints:
 *
 *   ┌──────────┬──────────────────────────────────┐
 *   │  Method  │  URL                             │
 *   ├──────────┼──────────────────────────────────┤
 *   │  POST    │  http://localhost:5001/register   │
 *   │  GET     │  http://localhost:5001/users      │
 *   │  GET     │  http://localhost:5001/users/1    │
 *   │  PUT     │  http://localhost:5001/users/1    │
 *   │  DELETE  │  http://localhost:5001/users/1    │
 *   └──────────┴──────────────────────────────────┘
 *
 * SAMPLE API REQUESTS AND RESPONSES:
 * ──────────────────────────────────
 *
 * === POST /register (Register a new user) ===
 * Request Body (JSON):
 *   {
 *     "name": "John Doe",
 *     "email": "john@example.com",
 *     "age": 25,
 *     "password": "Pass@1234"
 *   }
 * Success Response (201):
 *   {
 *     "success": true,
 *     "message": "User registered successfully",
 *     "data": { "id": 1, "name": "John Doe", "email": "john@example.com", "age": 25 }
 *   }
 * Error Response — Duplicate Email (409):
 *   {
 *     "success": false,
 *     "message": "Email already exists",
 *     "error": "A user with this email is already registered"
 *   }
 * Error Response — Validation Failed (400):
 *   {
 *     "success": false,
 *     "message": "Validation failed",
 *     "errors": ["Invalid email format", "Password must be at least 8 characters"]
 *   }
 *
 * === GET /users (Get all users) ===
 * Success Response (200):
 *   {
 *     "success": true,
 *     "count": 2,
 *     "data": [
 *       { "id": 2, "name": "Jane Smith", "email": "jane@example.com", "age": 30, "created_at": "..." },
 *       { "id": 1, "name": "John Doe", "email": "john@example.com", "age": 25, "created_at": "..." }
 *     ]
 *   }
 *
 * === GET /users/1 (Get single user) ===
 * Success Response (200):
 *   {
 *     "success": true,
 *     "data": { "id": 1, "name": "John Doe", "email": "john@example.com", "age": 25, "created_at": "..." }
 *   }
 * Error Response — Not Found (404):
 *   {
 *     "success": false,
 *     "message": "User not found",
 *     "error": "No user exists with ID 999"
 *   }
 *
 * === PUT /users/1 (Update a user) ===
 * Request Body (JSON):
 *   {
 *     "name": "John Updated",
 *     "email": "john.updated@example.com",
 *     "age": 26
 *   }
 * Success Response (200):
 *   {
 *     "success": true,
 *     "message": "User updated successfully",
 *     "data": { "id": 1, "name": "John Updated", "email": "john.updated@example.com", "age": 26 }
 *   }
 *
 * === DELETE /users/1 (Delete a user) ===
 * Success Response (200):
 *   {
 *     "success": true,
 *     "message": "User deleted successfully"
 *   }
 */

const express = require('express');
const cors = require('cors');

// Import database connection (this also tests the connection on startup)
const db = require('./db');

// Import route definitions
const userRoutes = require('./routes/userRoutes');

// Import user model to create the table on startup
const { createUsersTable } = require('./models/userModel');

// ─── Initialize Express App ────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5001;

// ─── Middleware Setup ───────────────────────────────────────────────
// cors() — Cross-Origin Resource Sharing
// Allows the frontend (http://localhost:5173) to make requests to this
// backend (http://localhost:5001). Without this, browsers would block
// the requests for security reasons.
app.use(cors());

// express.json() — JSON Body Parser
// Parses incoming JSON request bodies and makes them available as req.body
// Without this, req.body would be undefined when receiving POST/PUT data.
app.use(express.json());

// ─── Mount Routes ───────────────────────────────────────────────────
// All routes defined in userRoutes.js are mounted at the root path.
// So router.post('/register') becomes app.post('/register')
// and router.get('/users') becomes app.get('/users')
app.use('/', userRoutes);

// ─── Health Check Endpoint ──────────────────────────────────────────
// Simple endpoint to verify the server is running
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'User Management API is running',
    endpoints: {
      register: 'POST /register',
      getAll: 'GET /users',
      getValid: 'GET /valid-users',
      getInvalid: 'GET /invalid-users',
      getOne: 'GET /users/:id',
      update: 'PUT /users/:id',
      delete: 'DELETE /users/:id',
    },
  });
});

// ─── Start Server ───────────────────────────────────────────────────
// Create the users table first, then start listening for requests
createUsersTable().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📋 API endpoints available:`);
    console.log(`   POST   http://localhost:${PORT}/register`);
    console.log(`   GET    http://localhost:${PORT}/users`);
    console.log(`   GET    http://localhost:${PORT}/valid-users`);
    console.log(`   GET    http://localhost:${PORT}/invalid-users`);
    console.log(`   GET    http://localhost:${PORT}/users/:id`);
    console.log(`   PUT    http://localhost:${PORT}/users/:id`);
    console.log(`   DELETE http://localhost:${PORT}/users/:id`);
  });
});