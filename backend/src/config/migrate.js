/**
 * Simple migration runner: applies database/schema.sql then database/seed.sql
 * against the configured RDS/PostgreSQL instance. Safe to run once at
 * environment bootstrap (e.g. as a Kubernetes Job or init container).
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function run() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  await client.connect();
  console.log('Connected to database, applying schema...');

  // These live at backend/database/*.sql (copied into the image by
  // `COPY . .` in the Dockerfile, landing at /app/database/*.sql at
  // runtime since WORKDIR is /app). Do NOT point this at the top-level
  // /database folder - that one is only used by docker-compose's local
  // Postgres bind mount and never makes it into the backend image.
  const schemaPath = path.join(__dirname, '../../database/schema.sql');
  const seedPath = path.join(__dirname, '../../database/seed.sql');

  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  await client.query(schemaSql);
  console.log('Schema applied.');

  if (process.env.SEED_DB === 'true') {
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    await client.query(seedSql);
    console.log('Seed data inserted.');
  }

  await client.end();
  console.log('Migration complete.');
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
