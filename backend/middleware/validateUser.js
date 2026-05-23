/**
 * middleware/validateUser.js — Express Validation Middleware
 * ===========================================================
 *
 * MIDDLEWARE EXPLAINED:
 * ─────────────────────
 * Middleware is a function that runs BETWEEN receiving the request
 * and executing the route handler (controller). It can:
 *   1. Inspect the request data
 *   2. Modify the request/response
 *   3. End the request (by sending a response)
 *   4. Pass control to the next middleware/handler
 *
 * REQUEST-RESPONSE CYCLE:
 * ───────────────────────
 *   Client Request
 *       ↓
 *   express.json() middleware (parses JSON body)
 *       ↓
 *   validateRegistration middleware (checks data validity)
 *       ↓ (if valid)              ↓ (if invalid)
 *   Controller (process)     400 Error Response
 *       ↓
 *   Database Query
 *       ↓
 *   JSON Response to Client
 */

const { validateRegistration, validateUpdate } = require('../validators/userValidator');

// ─── Registration Validation Middleware ─────────────────────────────
// Intercepts POST /register requests before they reach the controller.
// If validation fails, it sends a 400 (Bad Request) response with errors.
// If validation passes, it calls next() to continue to the controller.
const validateRegistrationMiddleware = (req, res, next) => {
  // Extract the request body (parsed by express.json())
  const { name, email, age, password } = req.body;

  // Run all validators
  const result = validateRegistration({ name, email, age, password });

  // If invalid, return 400 with error details — request stops here
  if (!result.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: result.errors,
    });
  }

  // If valid, pass control to the next function (the controller)
  next();
};

// ─── Update Validation Middleware ───────────────────────────────────
// Similar to registration, but password is optional during updates.
const validateUpdateMiddleware = (req, res, next) => {
  const { name, email, age, password } = req.body;

  const result = validateUpdate({ name, email, age, password });

  if (!result.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: result.errors,
    });
  }

  next();
};

module.exports = {
  validateRegistrationMiddleware,
  validateUpdateMiddleware,
};
