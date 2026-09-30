const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { pool } = require('../config/database');
const { getCoordinates } = require('./userController');

let wageByCrop;
let averageWage;

function loadWages() {
  if (wageByCrop) return;
  const datasetPath = path.resolve(__dirname, '../../ml_engine/datasets/wage_demand_forecast_data.csv');
  const records = parse(fs.readFileSync(datasetPath), { columns: true, skip_empty_lines: true, trim: true });
  const totals = new Map();
  let total = 0;
  let count = 0;
  for (const record of records) {
    const crop = String(record.Crop_Type || '').trim().toLowerCase();
    const wage = Number(record.Market_Wage_Paid);
    if (!crop || !Number.isFinite(wage) || wage <= 0) continue;
    const aggregate = totals.get(crop) || { sum: 0, count: 0 };
    aggregate.sum += wage;
    aggregate.count += 1;
    totals.set(crop, aggregate);
    total += wage;
    count += 1;
  }
  wageByCrop = new Map([...totals].map(([crop, item]) => [crop, Math.round(item.sum / item.count)]));
  averageWage = count ? Math.round(total / count) : 350;
}

function getSuggestedWage(cropType) {
  try {
    loadWages();
    return wageByCrop.get(String(cropType || '').trim().toLowerCase()) || averageWage;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return 350;
  }
}

function positiveNumber(value, fallback, field) {
  if (value === undefined || value === null || value === '') return fallback;
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) {
    const error = new Error(`${field} must be a positive number.`);
    error.statusCode = 400;
    throw error;
  }
  return number;
}

function jobInput(body) {
  const title = String(body.title || body.jobTitle || '').trim();
  if (!title) {
    const error = new Error('title is required.');
    error.statusCode = 400;
    throw error;
  }
  const location = getCoordinates(body);
  if (!location) {
    const error = new Error('Job latitude and longitude are required.');
    error.statusCode = 400;
    throw error;
  }
  const workersNeeded = positiveNumber(body.workersNeeded, 1, 'workersNeeded');
  if (!Number.isInteger(workersNeeded)) {
    const error = new Error('workersNeeded must be a whole number.');
    error.statusCode = 400;
    throw error;
  }
  const cropType = body.cropType ? String(body.cropType).trim() : null;
  const suggestedWage = getSuggestedWage(cropType);
  const dailyWage = positiveNumber(body.dailyWage, suggestedWage, 'dailyWage');
  return {
    title,
    description: String(body.description || '').trim(),
    cropType,
    requiredSkill: body.requiredSkill ? String(body.requiredSkill).trim() : null,
    workersNeeded,
    dailyWage,
    suggestedWage,
    startDate: body.startDate || null,
    location,
  };
}

const jobSelect = `SELECT j.id, j.farmer_id AS "farmerId", j.title, j.description,
  j.crop_type AS "cropType", j.required_skill AS "requiredSkill",
  j.workers_needed AS "workersNeeded", j.daily_wage AS "dailyWage", j.status,
  j.start_date AS "startDate", j.created_at AS "createdAt",
  ST_Y(j.location::geometry) AS latitude, ST_X(j.location::geometry) AS longitude`;

async function listJobs(req, res, next) {
  try {
    const values = [];
    const conditions = ["j.status = 'open'"];
    if (req.query.cropType) {
      values.push(String(req.query.cropType));
      conditions.push(`j.crop_type ILIKE $${values.length}`);
      values[values.length - 1] = `%${values[values.length - 1]}%`;
    }
    if (req.query.skill) {
      values.push(String(req.query.skill));
      conditions.push(`j.required_skill ILIKE $${values.length}`);
      values[values.length - 1] = `%${values[values.length - 1]}%`;
    }
    const coordinates = req.query.lat === undefined && req.query.lng === undefined ? null : getCoordinates(req.query);
    if (coordinates) {
      const radiusKm = positiveNumber(req.query.radiusKm, 50, 'radiusKm');
      values.push(coordinates.lng, coordinates.lat, radiusKm * 1000);
      conditions.push(`ST_DWithin(j.location, ST_SetSRID(ST_MakePoint($${values.length - 2}, $${values.length - 1}), 4326)::geography, $${values.length})`);
    }
    const limit = Math.min(Math.floor(positiveNumber(req.query.limit, 50, 'limit')), 100);
    values.push(limit);
    const distance = coordinates
      ? `, ST_Distance(j.location, ST_SetSRID(ST_MakePoint($${values.length - 3}, $${values.length - 2}), 4326)::geography) / 1000 AS "distanceKm"`
      : '';
    const result = await pool.query(
      `${jobSelect}${distance} FROM jobs j WHERE ${conditions.join(' AND ')} ORDER BY j.created_at DESC LIMIT $${values.length}`,
      values,
    );
    return res.json({ jobs: result.rows, count: result.rowCount });
  } catch (error) {
    return next(error);
  }
}

async function getMatches(req, res, next) {
  try {
    const profile = await pool.query(
      `SELECT skills, ST_Y(location::geometry) AS latitude, ST_X(location::geometry) AS longitude
       FROM users WHERE id = $1`,
      [req.user.id],
    );
    if (!profile.rows[0]) return res.status(404).json({ error: 'Worker profile not found.' });
    const coordinates = req.query.lat === undefined && req.query.lng === undefined
      ? profile.rows[0].latitude === null ? null : { lat: Number(profile.rows[0].latitude), lng: Number(profile.rows[0].longitude) }
      : getCoordinates(req.query);
    if (!coordinates) return res.status(400).json({ error: 'Add a location to your profile or provide lat and lng query parameters.' });

    const radiusKm = positiveNumber(req.query.radiusKm, 50, 'radiusKm');
    const limit = Math.min(Math.floor(positiveNumber(req.query.limit, 50, 'limit')), 100);
    const skill = req.query.skill ? String(req.query.skill).trim() : null;
    const result = await pool.query(
      `${jobSelect}, ST_Distance(j.location, ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography) / 1000 AS "distanceKm"
       FROM jobs j JOIN users w ON w.id = $1
       WHERE j.status = 'open'
         AND ST_DWithin(j.location, ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography, $4)
         AND ($5::text IS NOT NULL OR j.required_skill IS NULL
           OR EXISTS (SELECT 1 FROM unnest(w.skills) AS worker_skill
             WHERE j.required_skill ILIKE '%' || worker_skill || '%'))
         AND ($5::text IS NULL OR j.required_skill ILIKE '%' || $5 || '%')
       ORDER BY ST_Distance(j.location, ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography)
       LIMIT $6`,
      [req.user.id, coordinates.lng, coordinates.lat, radiusKm * 1000, skill, limit],
    );
    return res.json({ jobs: result.rows, count: result.rowCount, radiusKm });
  } catch (error) {
    return next(error);
  }
}

async function getJob(req, res, next) {
  try {
    const result = await pool.query(`${jobSelect} FROM jobs j WHERE j.id = $1`, [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Job not found.' });
    return res.json({ job: result.rows[0] });
  } catch (error) {
    return next(error);
  }
}

async function createJob(req, res, next) {
  try {
    const job = jobInput(req.body);
    const result = await pool.query(
      `INSERT INTO jobs (farmer_id, title, description, crop_type, required_skill,
        workers_needed, daily_wage, start_date, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8,
         ST_SetSRID(ST_MakePoint($9, $10), 4326)::geography)
       RETURNING id, farmer_id AS "farmerId", title, description, crop_type AS "cropType",
         required_skill AS "requiredSkill", workers_needed AS "workersNeeded",
         daily_wage AS "dailyWage", status, start_date AS "startDate", created_at AS "createdAt",
         ST_Y(location::geometry) AS latitude, ST_X(location::geometry) AS longitude`,
      [req.user.id, job.title, job.description, job.cropType, job.requiredSkill,
        job.workersNeeded, job.dailyWage, job.startDate, job.location.lng, job.location.lat],
    );
    return res.status(201).json({ job: result.rows[0], suggestedWage: job.suggestedWage });
  } catch (error) {
    return next(error);
  }
}

async function updateJob(req, res, next) {
  try {
    const status = req.body.status;
    if (!['open', 'closed'].includes(status)) return res.status(400).json({ error: 'status must be open or closed.' });
    const result = await pool.query(
      `UPDATE jobs SET status = $3, updated_at = NOW()
       WHERE id = $1 AND farmer_id = $2
       RETURNING id, farmer_id AS "farmerId", title, description, crop_type AS "cropType",
         required_skill AS "requiredSkill", workers_needed AS "workersNeeded",
         daily_wage AS "dailyWage", status, start_date AS "startDate", created_at AS "createdAt",
         ST_Y(location::geometry) AS latitude, ST_X(location::geometry) AS longitude`,
      [req.params.id, req.user.id, status],
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Job not found or not owned by this farmer.' });
    return res.json({ job: result.rows[0] });
  } catch (error) {
    return next(error);
  }
}

module.exports = { createJob, getJob, getMatches, getSuggestedWage, jobInput, listJobs, updateJob };