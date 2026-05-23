/**
 * db.js — MySQL Database Connection Module
 * ==========================================
 *
 * DATABASE CONNECTION EXPLAINED:
 * ─────────────────────────────
 * 1. We use mysql2 package to connect Node.js with MySQL database.
 *
 * 2. A "connection pool" is used instead of a single connection.
 *    - A pool pre-creates multiple connections and reuses them.
 *    - This is more efficient than opening/closing connections for each query.
 *    - connectionLimit: 10 means up to 10 simultaneous queries can run.
 *
 * 3. We use the promise-based version (.promise()) so we can use
 *    modern async/await syntax instead of callbacks.
 *
 * HOW TO CONNECT MySQL:
 * ─────────────────────
 * 1. Install MySQL on your machine (or use XAMPP/WAMP/MAMP)
 * 2. Open MySQL Workbench
 * 3. Create a new database:
 *      CREATE DATABASE user_management;
 * 4. Update the DB_PASSWORD below with your MySQL root password
 * 5. The app will auto-create the users table on startup
 */

const mysql = require('mysql2');

// ─── Database Configuration ─────────────────────────────────────────
// These values should match your MySQL Workbench connection settings
const DB_CONFIG = {
  host: 'localhost',       // MySQL server address (localhost for local dev)
  user: 'root',            // MySQL username (default is 'root')
  password: 'joshi2005',   // ⚠️ Replace with YOUR MySQL root password
  database: 'user_management', // Database name (we'll create this)
  port: 3306,              // Default MySQL port
  waitForConnections: true, // Wait if all connections are in use
  connectionLimit: 10,      // Max number of connections in the pool
  queueLimit: 0,            // Unlimited queue (0 = no limit)
};

// ─── Create Connection Pool ─────────────────────────────────────────
// The pool manages multiple database connections automatically.
// When a query finishes, the connection is returned to the pool.
const pool = mysql.createPool(DB_CONFIG);

// ─── Promise-based Pool ─────────────────────────────────────────────
// .promise() wraps the pool so we can use async/await instead of callbacks
// Example: const [rows] = await db.query('SELECT * FROM users');
const db = pool.promise();

// ─── Test Connection ────────────────────────────────────────────────
// Try to get a connection from the pool to verify MySQL is running.
// If successful, release it back to the pool immediately.
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database Connection Error:', err.message);
    console.error('   Make sure MySQL is running and credentials are correct.');
  } else {
    console.log('✅ MySQL Connected Successfully');
    connection.release(); // Always release connections back to the pool
  }
});

// Export the promise-based pool for use in other files
module.exports = db;
