const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'harvest_hub',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});

async function initializeDatabase() {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        mobile VARCHAR(20) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL DEFAULT '',
        role ENUM('farmer','worker') NOT NULL,
        skills JSON NULL,
        experience_years DECIMAL(5,2) NOT NULL DEFAULT 0,
        latitude DECIMAL(10,7) NULL,
        longitude DECIMAL(10,7) NULL,
        village VARCHAR(150) NULL,
        is_available BOOLEAN NOT NULL DEFAULT TRUE,
        expected_daily_wage DECIMAL(10,2) NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX users_role_available_idx (role, is_available)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        farmer_id BIGINT UNSIGNED NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT NULL,
        crop_type VARCHAR(100) NULL,
        required_skill VARCHAR(150) NULL,
        workers_needed INT NOT NULL DEFAULT 1,
        daily_wage DECIMAL(10,2) NOT NULL,
        status ENUM('open','closed','accepted') NOT NULL DEFAULT 'open',
        start_date DATE NULL,
        location_name VARCHAR(200) NULL,
        latitude DECIMAL(10,7) NOT NULL,
        longitude DECIMAL(10,7) NOT NULL,
        accepted_worker_id BIGINT UNSIGNED NULL,
        accepted_at DATETIME NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT jobs_farmer_fk FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT jobs_worker_fk FOREIGN KEY (accepted_worker_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX jobs_status_created_idx (status, created_at),
        INDEX jobs_farmer_idx (farmer_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS job_acceptances (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        job_id BIGINT UNSIGNED NOT NULL,
        worker_id BIGINT UNSIGNED NOT NULL,
        agreed_wage DECIMAL(10,2) NOT NULL,
        accepted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY one_acceptance_per_job (job_id),
        CONSTRAINT acceptance_job_fk FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
        CONSTRAINT acceptance_worker_fk FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS job_applications (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        job_id BIGINT UNSIGNED NOT NULL,
        worker_id BIGINT UNSIGNED NOT NULL,
        agreed_wage DECIMAL(10,2) NOT NULL,
        status ENUM('pending','accepted','rejected','completed') NOT NULL DEFAULT 'pending',
        applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        decided_at DATETIME NULL,
        completed_at DATETIME NULL,
        UNIQUE KEY one_application_per_worker_job (job_id, worker_id),
        INDEX job_applications_worker_status_idx (worker_id, status),
        CONSTRAINT application_job_fk FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
        CONSTRAINT application_worker_fk FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sync_actions (
        user_id BIGINT UNSIGNED NOT NULL,
        action_id VARCHAR(191) NOT NULL,
        result JSON NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, action_id),
        CONSTRAINT sync_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } finally {
    connection.release();
  }
}

module.exports = { pool, initializeDatabase };
