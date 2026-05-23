/**
 * routes/userRoutes.js — Express Route Definitions
 * ===================================================
 *
 * EXPRESS ROUTE SETUP EXPLAINED:
 * ──────────────────────────────
 * Routes define the URL paths and HTTP methods for our API.
 * Each route maps to:
 *   1. An HTTP method (GET, POST, PUT, DELETE)
 *   2. A URL path (/register, /users, /users/:id)
 *   3. Optional middleware (validation)
 *   4. A controller function (handles the logic)
 *
 * The :id in /users/:id is a URL parameter — Express extracts it
 * and makes it available as req.params.id
 *
 * API ENDPOINTS:
 * ──────────────
 *   POST   /register       → Register a new user
 *   GET    /users          → Get all users with validation status
 *   GET    /valid-users    → Get only valid users
 *   GET    /invalid-users  → Get only invalid users
 *   GET    /users/:id      → Get a single user by ID
 *   PUT    /users/:id      → Update a user by ID
 *   DELETE /users/:id      → Delete a user by ID
 */

const express = require('express');
const router = express.Router();

// Import controller functions (handle the actual logic)
const userController = require('../controllers/userController');

// Import validation middleware (runs before the controller)
const {
  validateRegistrationMiddleware,
  validateUpdateMiddleware,
} = require('../middleware/validateUser');

// ─── POST /register ─────────────────────────────────────────────────
// Flow: Request → validateRegistrationMiddleware → registerUser controller
// Middleware checks data validity; if invalid, returns 400 error.
// If valid, controller inserts into database and returns 201.
router.post('/register', validateRegistrationMiddleware, userController.registerUser);

// ─── GET /users ──────────────────────────────────────────────────────
// Returns all users with their validation status (VALID/INVALID).
// The backend re-validates each record dynamically on every fetch.
router.get('/users', userController.getAllUsers);

// ─── GET /valid-users ────────────────────────────────────────────────
// Returns only users whose records pass all validation rules.
router.get('/valid-users', userController.getValidUsers);

// ─── GET /invalid-users ──────────────────────────────────────────────
// Returns only users whose records fail validation.
// Each invalid user includes a 'reasons' array with specific error messages.
router.get('/invalid-users', userController.getInvalidUsers);

// ─── GET /users/:id ─────────────────────────────────────────────────
// :id is a URL parameter (e.g., /users/5 → req.params.id = "5")
router.get('/users/:id', userController.getUserById);

// ─── PUT /users/:id ─────────────────────────────────────────────────
// Flow: Request → validateUpdateMiddleware → updateUser controller
router.put('/users/:id', validateUpdateMiddleware, userController.updateUser);

// ─── DELETE /users/:id ──────────────────────────────────────────────
// No validation middleware needed — just need the ID from params.
router.delete('/users/:id', userController.deleteUser);

module.exports = router;
