/**
 * db.js - Database connection and table setup for Aiven PostgreSQL
 */
const { Pool } = require('pg');

// ============================================
// AIVEN POSTGRESQL CREDENTIALS
// ============================================
const DB_HOST = process.env.DB_HOST;
const DB_PORT = parseInt(process.env.DB_PORT || '26553', 10);
const DB_USER = process.env.DB_USER;
const DB_NAME = process.env.DB_NAME;
const DB_PASSWORD = process.env.DB_PASSWORD;

/**
 * Connection pool with SSL for Aiven PostgreSQL.
 */
const pool = new Pool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  ssl: {
    rejectUnauthorized: false, // Required for Aiven's cloud certificates
  },
  connectionTimeoutMillis: 10000,
});

/**
 * Users table schema for PostgreSQL.
 */
const CREATE_USERS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

/**
 * Initializes DB: verifies connection, then creates users table if missing.
 */
async function initDatabase() {
  let client;
  try {
    client = await pool.connect();
    console.log('Connected to PostgreSQL');
    await client.query(CREATE_USERS_TABLE_SQL);
    console.log('Table ready');
  } catch (err) {
    console.error('Database initialization failed:', err.message);
    throw err;
  } finally {
    if (client) client.release();
  }
}

// Helper to match mysql2's pool.execute (pg uses pool.query)
// pg's query returns an object with 'rows' property, mysql2 returns [rows, fields]
// We'll wrap it to minimize changes in server.js, but server.js needs update anyway for placeholders
const execute = async (text, params) => {
  const res = await pool.query(text, params);
  return [res.rows, res];
};

module.exports = { pool, initDatabase, execute };
