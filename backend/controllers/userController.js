/**
 * controllers/userController.js — API Controller Functions
 * =========================================================
 *
 * API FLOW EXPLAINED:
 * ───────────────────
 * Each controller function handles ONE specific API endpoint.
 * The flow for each request is:
 *
 *   1. Extract data from req.body (POST/PUT) or req.params (GET/DELETE)
 *   2. Call the model function to interact with the database
 *   3. Send a JSON response with appropriate HTTP status code
 *   4. Handle errors in the catch block
 *
 * HTTP STATUS CODES USED:
 * ───────────────────────
 *   200 — OK (successful GET, PUT, DELETE)
 *   201 — Created (successful POST)
 *   400 — Bad Request (validation errors, missing fields)
 *   404 — Not Found (user doesn't exist)
 *   409 — Conflict (duplicate email)
 *   500 — Internal Server Error (database/server errors)
 */

const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');

// Import the database record validator
// This function re-checks stored records against validation rules
const { validateDatabaseRecord } = require('../validators/userValidator');

// ─── POST /register — Register a New User ──────────────────────────
// REQUEST BODY: { name, email, age, password }
// RESPONSE: { success: true, message, data: { id, name, email, age } }
//
// Steps:
//   1. Check if email already exists in database
//   2. Hash the password using bcrypt (never store plain text!)
//   3. Insert the new user into the database
//   4. Return success response with the new user's data
const registerUser = async (req, res) => {
  try {
    const { name, email, age, password } = req.body;

    // Step 1: Check for duplicate email
    const existingUser = await UserModel.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists',
        error: 'A user with this email is already registered',
      });
    }

    // Step 2: Hash the password
    // bcrypt.hash(plainText, saltRounds)
    // Salt rounds = 10 means the hash is computed 2^10 times (secure but fast)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Step 3: Insert into database
    const result = await UserModel.createUser(
      name.trim(),
      email.trim().toLowerCase(),
      Number(age),
      hashedPassword
    );

    // Step 4: Return success response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: result.insertId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        age: Number(age),
      },
    });
  } catch (error) {
    console.error('Error registering user:', error);

    // Handle MySQL duplicate entry error (extra safety net)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Email already exists',
        error: 'A user with this email is already registered',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to register user',
    });
  }
};

// ─── GET /users — Get All Users with Validation Status ──────────────
// BACKEND VALIDATION FLOW:
//   1. Fetch ALL users from the database
//   2. Loop through each user record
//   3. Re-validate each record using validateDatabaseRecord()
//   4. Attach status ('VALID' or 'INVALID') and reasons to each user
//   5. Update the status column in the database if it changed
//   6. Return all users with their validation classification
//
// This ensures that even if invalid data was inserted directly via
// MySQL Workbench or raw SQL, it will be detected and flagged.
//
// RESPONSE: { success, count, validCount, invalidCount, data: [...] }
const getAllUsers = async (req, res) => {
  try {
    // Step 1: Fetch all users from the database
    const users = await UserModel.getAllUsers();

    // Step 2 & 3: Re-validate each record and attach status
    const usersWithStatus = await Promise.all(
      users.map(async (user) => {
        // Run validation on the stored record
        const validation = validateDatabaseRecord(user);

        // Step 5: Update status in database if it changed
        if (user.status !== validation.status) {
          await UserModel.updateUserStatus(user.id, validation.status);
        }

        // Step 4: Return user with validation info attached
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          age: user.age,
          status: validation.status,
          ...(validation.status === 'INVALID' ? { reasons: validation.reasons } : {}),
          created_at: user.created_at,
        };
      })
    );

    // Count valid and invalid users for the response summary
    const validCount = usersWithStatus.filter((u) => u.status === 'VALID').length;
    const invalidCount = usersWithStatus.filter((u) => u.status === 'INVALID').length;

    res.status(200).json({
      success: true,
      count: usersWithStatus.length,
      validCount,
      invalidCount,
      data: usersWithStatus,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to fetch users',
    });
  }
};

// ─── GET /valid-users — Get Only Valid Users ────────────────────────
// HOW VALIDATION HAPPENS DURING FETCHING:
//   1. Fetch all users from database
//   2. Re-validate each record using validateDatabaseRecord()
//   3. Filter to keep only records where status === 'VALID'
//   4. Return the filtered list
//
// API WORKING PROCESS:
//   Client sends GET /valid-users
//   → Server fetches all users
//   → Re-validates each record
//   → Filters only valid ones
//   → Returns filtered array with 200 status
const getValidUsers = async (req, res) => {
  try {
    const users = await UserModel.getAllUsers();

    // Re-validate and filter — keep only VALID users
    const validUsers = users
      .map((user) => {
        const validation = validateDatabaseRecord(user);
        return { ...user, status: validation.status };
      })
      .filter((user) => user.status === 'VALID');

    res.status(200).json({
      success: true,
      count: validUsers.length,
      data: validUsers,
    });
  } catch (error) {
    console.error('Error fetching valid users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to fetch valid users',
    });
  }
};

// ─── GET /invalid-users — Get Only Invalid Users ────────────────────
// Same flow as /valid-users, but filters for INVALID records.
// Includes the specific 'reasons' array explaining why each user is invalid.
//
// Example response:
//   {
//     "success": true,
//     "count": 1,
//     "data": [{
//       "name": "Sai",
//       "email": "sai",
//       "status": "INVALID",
//       "reasons": ["Invalid email format"]
//     }]
//   }
const getInvalidUsers = async (req, res) => {
  try {
    const users = await UserModel.getAllUsers();

    // Re-validate and filter — keep only INVALID users
    const invalidUsers = users
      .map((user) => {
        const validation = validateDatabaseRecord(user);
        return {
          ...user,
          status: validation.status,
          reasons: validation.reasons,
        };
      })
      .filter((user) => user.status === 'INVALID');

    res.status(200).json({
      success: true,
      count: invalidUsers.length,
      data: invalidUsers,
    });
  } catch (error) {
    console.error('Error fetching invalid users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to fetch invalid users',
    });
  }
};

// ─── GET /users/:id — Get Single User ──────────────────────────────
// REQUEST PARAMS: id (from URL)
// RESPONSE: { success: true, data: { id, name, email, age, created_at } }
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserModel.getUserById(id);

    // If no user found with this ID, return 404
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: `No user exists with ID ${id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to fetch user',
    });
  }
};

// ─── PUT /users/:id — Update a User ────────────────────────────────
// REQUEST PARAMS: id (from URL)
// REQUEST BODY: { name, email, age, password? }
// password is optional — if provided, it will be re-hashed
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, age, password } = req.body;

    // Check if user exists before updating
    const existingUser = await UserModel.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: `No user exists with ID ${id}`,
      });
    }

    // Check if new email conflicts with another user
    if (email !== existingUser.email) {
      const emailTaken = await UserModel.getUserByEmail(email);
      if (emailTaken && emailTaken.id !== Number(id)) {
        return res.status(409).json({
          success: false,
          message: 'Email already exists',
          error: 'Another user is already using this email',
        });
      }
    }

    // Hash new password if provided, otherwise pass null (keeps old password)
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Perform the update
    const result = await UserModel.updateUser(
      id,
      name.trim(),
      email.trim().toLowerCase(),
      Number(age),
      hashedPassword
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: Number(id),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        age: Number(age),
      },
    });
  } catch (error) {
    console.error('Error updating user:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Email already exists',
        error: 'Another user is already using this email',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to update user',
    });
  }
};

// ─── DELETE /users/:id — Delete a User ──────────────────────────────
// REQUEST PARAMS: id (from URL)
// RESPONSE: { success: true, message: 'User deleted successfully' }
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await UserModel.deleteUser(id);

    // affectedRows === 0 means no row was deleted (user doesn't exist)
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: `No user exists with ID ${id}`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to delete user',
    });
  }
};

module.exports = {
  registerUser,
  getAllUsers,
  getValidUsers,
  getInvalidUsers,
  getUserById,
  updateUser,
  deleteUser,
};
