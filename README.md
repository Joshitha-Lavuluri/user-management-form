# React User Management System

This project contains a full User Management System built with React.js, Node.js, Express.js, MySQL, and Axios.

## Project Structure

backend/
  server.js
  package.json

frontend/
  package.json
  vite.config.js
  public/
    index.html
  src/
    main.jsx
    App.jsx
    index.css

## Setup Instructions

1. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

3. Create MySQL database and table:
   ```sql
   CREATE DATABASE usermanagement;
   USE usermanagement;
   CREATE TABLE users(
     id INT PRIMARY KEY AUTO_INCREMENT,
     name VARCHAR(100),
     email VARCHAR(100),
     age INT
   );
   ```

4. Start backend server with MySQL credentials:
   ```bash
   cd ../backend
   PORT=5001 DB_USER=root DB_PASSWORD=your_password DB_NAME=usermanagement npm run dev
   ```
   If your root user has no password, use `DB_PASSWORD=`.

5. Start frontend server:
   ```bash
   cd ../frontend
   npm run dev
   ```

5. Start frontend server:
   ```bash
   cd ../frontend
   npm run dev
   ```

6. Open the frontend app in your browser at the URL shown by Vite, usually `http://localhost:5173`.

## Notes

- If your MySQL user or password differs, update the connection settings in `backend/server.js`.
- The frontend uses Axios to call the backend REST API.
- CRUD operations are available for users: create, read, update, delete.
