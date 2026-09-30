const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error.message);
});

async function initializeDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required. Configure it in backend/.env.');
  }

  const client = await pool.connect();
  try {
    await client.query('CREATE EXTENSION IF NOT EXISTS postgis');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        mobile TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('farmer', 'worker')),
        skills TEXT[] NOT NULL DEFAULT '{}',
        experience_years NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (experience_years >= 0),
        location GEOGRAPHY(POINT, 4326),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id BIGSERIAL PRIMARY KEY,
        farmer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        crop_type TEXT,
        required_skill TEXT,
        workers_needed INTEGER NOT NULL DEFAULT 1 CHECK (workers_needed > 0),
        daily_wage NUMERIC(10, 2) NOT NULL CHECK (daily_wage > 0),
        status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
        start_date DATE,
        location GEOGRAPHY(POINT, 4326) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS sync_actions (
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        action_id TEXT NOT NULL,
        result JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, action_id)
      )
    `);
    await client.query('CREATE INDEX IF NOT EXISTS users_location_gix ON users USING GIST (location)');
    await client.query('CREATE INDEX IF NOT EXISTS jobs_location_gix ON jobs USING GIST (location)');
    await client.query('CREATE INDEX IF NOT EXISTS jobs_status_idx ON jobs (status, created_at DESC)');
  } finally {
    client.release();
  }
}

module.exports = { pool, initializeDatabase };