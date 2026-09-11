const { Pool } = require('pg');

// AWS RDS-ready connection pool.
// In production, set DB_SSL=true so pg connects using TLS to RDS.
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'shopsphere',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error', err);
  process.exit(1);
});

async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV !== 'production') {
    console.log('executed query', { text, duration, rows: result.rowCount });
  }
  return result;
}

async function getClient() {
  return pool.connect();
}

module.exports = { pool, query, getClient };
