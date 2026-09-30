const { pool } = require('../config/database');
const { jobInput } = require('../controllers/jobController');

function safeActionId(value) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= 128;
}

async function applyAction(client, user, action) {
  if (action.type === 'create_job') {
    if (user.role !== 'farmer') {
      const error = new Error('Only farmers can create jobs.');
      error.statusCode = 403;
      throw error;
    }
    const job = jobInput(action.payload || {});
    const result = await client.query(
      `INSERT INTO jobs (farmer_id, title, description, crop_type, required_skill,
        workers_needed, daily_wage, start_date, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8,
         ST_SetSRID(ST_MakePoint($9, $10), 4326)::geography)
       RETURNING id, farmer_id AS "farmerId", title, description, crop_type AS "cropType",
         required_skill AS "requiredSkill", workers_needed AS "workersNeeded",
         daily_wage AS "dailyWage", status, start_date AS "startDate", created_at AS "createdAt",
         ST_Y(location::geometry) AS latitude, ST_X(location::geometry) AS longitude`,
      [user.id, job.title, job.description, job.cropType, job.requiredSkill,
        job.workersNeeded, job.dailyWage, job.startDate, job.location.lng, job.location.lat],
    );
    return { job: result.rows[0], suggestedWage: job.suggestedWage };
  }

  if (action.type === 'update_profile') {
    const payload = action.payload || {};
    const name = payload.name === undefined ? null : String(payload.name).trim();
    if (name !== null && !name) {
      const error = new Error('name cannot be empty.');
      error.statusCode = 400;
      throw error;
    }
    let skills = null;
    if (payload.skills !== undefined) {
      if (!Array.isArray(payload.skills)) {
        const error = new Error('skills must be an array.');
        error.statusCode = 400;
        throw error;
      }
      skills = payload.skills.map((skill) => String(skill).trim()).filter(Boolean).slice(0, 30);
    }
    const years = payload.experienceYears === undefined ? null : Number(payload.experienceYears);
    if (years !== null && (!Number.isFinite(years) || years < 0 || years > 80)) {
      const error = new Error('experienceYears must be between 0 and 80.');
      error.statusCode = 400;
      throw error;
    }
    const hasLocation = payload.latitude !== undefined || payload.longitude !== undefined
      || payload.lat !== undefined || payload.lng !== undefined || payload.location !== undefined;
    const location = hasLocation ? require('../controllers/userController').getCoordinates(payload) : null;
    if (!name && !skills && years === null && !hasLocation) {
      const error = new Error('No profile fields were provided.');
      error.statusCode = 400;
      throw error;
    }
    const result = await client.query(
      `UPDATE users SET name = COALESCE($2, name), skills = COALESCE($3::text[], skills),
         experience_years = COALESCE($4, experience_years),
         location = CASE WHEN $5::boolean THEN ST_SetSRID(ST_MakePoint($6, $7), 4326)::geography ELSE location END,
         updated_at = NOW()
       WHERE id = $1
       RETURNING id, name, mobile, role, skills, experience_years, created_at,
         ST_Y(location::geometry) AS latitude, ST_X(location::geometry) AS longitude`,
      [user.id, name, skills, years, Boolean(location), location?.lng ?? null, location?.lat ?? null],
    );
    return { user: result.rows[0] };
  }

  const error = new Error(`Unsupported offline action type: ${String(action.type || 'unknown')}.`);
  error.statusCode = 400;
  throw error;
}

async function processAction(user, action) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))', [String(user.id), action.id]);
    const existing = await client.query(
      'SELECT result FROM sync_actions WHERE user_id = $1 AND action_id = $2',
      [user.id, action.id],
    );
    if (existing.rows[0]) {
      await client.query('COMMIT');
      return { id: action.id, status: 'duplicate', result: existing.rows[0].result };
    }

    const result = await applyAction(client, user, action);
    await client.query(
      'INSERT INTO sync_actions (user_id, action_id, result) VALUES ($1, $2, $3::jsonb)',
      [user.id, action.id, JSON.stringify(result)],
    );
    await client.query('COMMIT');
    return { id: action.id, status: 'synced', result };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    return { id: action.id, status: 'failed', error: error.message, statusCode: error.statusCode || 400 };
  } finally {
    client.release();
  }
}

async function offlineSync(req, res, next) {
  try {
    const actions = req.body.actions;
    if (!Array.isArray(actions) || actions.length === 0 || actions.length > 50) {
      return res.status(400).json({ error: 'actions must be a non-empty array containing at most 50 actions.' });
    }
    if (actions.some((action) => !action || !safeActionId(action.id) || typeof action.type !== 'string')) {
      return res.status(400).json({ error: 'Each action needs a string id (max 128 characters) and type.' });
    }
    const results = [];
    for (const action of actions) results.push(await processAction(req.user, action));
    const failed = results.filter((result) => result.status === 'failed').length;
    return res.status(failed ? 207 : 200).json({ results, synced: results.length - failed, failed });
  } catch (error) {
    return next(error);
  }
}

module.exports = { offlineSync };