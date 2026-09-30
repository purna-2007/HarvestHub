const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

function getCoordinates(input) {
  const location = input.location || input;
  const latitude = location.latitude ?? location.lat;
  const longitude = location.longitude ?? location.lng ?? location.lon;
  if (latitude === undefined && longitude === undefined) return null;

  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    const error = new Error('Provide valid latitude and longitude values.');
    error.statusCode = 400;
    throw error;
  }
  return { lat, lng };
}

function publicUser(row) {
  return {
    id: row.id,
    name: row.name,
    mobile: row.mobile,
    role: row.role,
    skills: row.skills,
    experienceYears: Number(row.experience_years),
    latitude: row.latitude === null ? null : Number(row.latitude),
    longitude: row.longitude === null ? null : Number(row.longitude),
    createdAt: row.created_at,
  };
}

function createToken(user) {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured.');
  return jwt.sign({ sub: String(user.id), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

async function register(req, res, next) {
  try {
    const { name, mobile, password, role } = req.body;
    if (!name?.trim() || !mobile || !password || !['farmer', 'worker'].includes(role)) {
      return res.status(400).json({ error: 'name, mobile, password, and a farmer or worker role are required.' });
    }
    const normalizedMobile = String(mobile).replace(/[\s()-]/g, '');
    if (!/^\+?\d{10,15}$/.test(normalizedMobile)) {
      return res.status(400).json({ error: 'Enter a valid mobile number.' });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    const coordinates = getCoordinates(req.body);
    const skills = Array.isArray(req.body.skills)
      ? req.body.skills.map((skill) => String(skill).trim()).filter(Boolean).slice(0, 30)
      : [];
    const experienceYears = Number(req.body.experienceYears || 0);
    if (!Number.isFinite(experienceYears) || experienceYears < 0 || experienceYears > 80) {
      return res.status(400).json({ error: 'experienceYears must be between 0 and 80.' });
    }

    const passwordHash = await bcrypt.hash(String(password), 12);
    const result = await pool.query(
      `INSERT INTO users (name, mobile, password_hash, role, skills, experience_years, location)
       VALUES ($1, $2, $3, $4, $5, $6,
         CASE WHEN $7::double precision IS NULL THEN NULL
         ELSE ST_SetSRID(ST_MakePoint($8, $7), 4326)::geography END)
       RETURNING id, name, mobile, role, skills, experience_years, created_at,
         ST_Y(location::geometry) AS latitude, ST_X(location::geometry) AS longitude`,
      [name.trim(), normalizedMobile, passwordHash, role, skills, experienceYears,
        coordinates?.lat ?? null, coordinates?.lng ?? null],
    );
    const user = publicUser(result.rows[0]);
    return res.status(201).json({ user, token: createToken(user) });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'An account with this mobile number already exists.' });
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const mobile = String(req.body.mobile || '').replace(/[\s()-]/g, '');
    const { password } = req.body;
    if (!mobile || !password) return res.status(400).json({ error: 'mobile and password are required.' });

    const result = await pool.query(
      `SELECT id, name, mobile, role, skills, experience_years, password_hash, created_at,
        ST_Y(location::geometry) AS latitude, ST_X(location::geometry) AS longitude
       FROM users WHERE mobile = $1`,
      [mobile],
    );
    const row = result.rows[0];
    if (!row || !(await bcrypt.compare(String(password), row.password_hash))) {
      return res.status(401).json({ error: 'Invalid mobile number or password.' });
    }
    const user = publicUser(row);
    return res.json({ user, token: createToken(user) });
  } catch (error) {
    return next(error);
  }
}

function authenticateToken(req, res, next) {
  const [scheme, token] = String(req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) return res.status(401).json({ error: 'A bearer token is required.' });
  if (!process.env.JWT_SECRET) return res.status(500).json({ error: 'Authentication is not configured.' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: Number(payload.sub), role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ error: 'The bearer token is invalid or expired.' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) return res.status(403).json({ error: 'This account cannot perform that action.' });
    return next();
  };
}

async function getMe(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT id, name, mobile, role, skills, experience_years, created_at,
        ST_Y(location::geometry) AS latitude, ST_X(location::geometry) AS longitude
       FROM users WHERE id = $1`,
      [req.user.id],
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'User not found.' });
    return res.json({ user: publicUser(result.rows[0]) });
  } catch (error) {
    return next(error);
  }
}

async function updateMe(req, res, next) {
  try {
    const allowed = ['name', 'skills', 'experienceYears'];
    if (!allowed.some((field) => Object.hasOwn(req.body, field))
      && !Object.hasOwn(req.body, 'latitude') && !Object.hasOwn(req.body, 'longitude')
      && !Object.hasOwn(req.body, 'lat') && !Object.hasOwn(req.body, 'lng')
      && !Object.hasOwn(req.body, 'location')) {
      return res.status(400).json({ error: 'No profile fields were provided.' });
    }

    const coordinates = getCoordinates(req.body);
    const name = req.body.name === undefined ? null : String(req.body.name).trim();
    if (name !== null && !name) return res.status(400).json({ error: 'name cannot be empty.' });
    const skills = req.body.skills === undefined ? null
      : Array.isArray(req.body.skills) ? req.body.skills.map((skill) => String(skill).trim()).filter(Boolean).slice(0, 30) : null;
    if (req.body.skills !== undefined && skills === null) return res.status(400).json({ error: 'skills must be an array.' });
    const experienceYears = req.body.experienceYears === undefined ? null : Number(req.body.experienceYears);
    if (experienceYears !== null && (!Number.isFinite(experienceYears) || experienceYears < 0 || experienceYears > 80)) {
      return res.status(400).json({ error: 'experienceYears must be between 0 and 80.' });
    }

    const result = await pool.query(
      `UPDATE users SET
         name = COALESCE($2, name),
         skills = COALESCE($3::text[], skills),
         experience_years = COALESCE($4, experience_years),
         location = CASE WHEN $5::boolean THEN ST_SetSRID(ST_MakePoint($6, $7), 4326)::geography ELSE location END,
         updated_at = NOW()
       WHERE id = $1
       RETURNING id, name, mobile, role, skills, experience_years, created_at,
         ST_Y(location::geometry) AS latitude, ST_X(location::geometry) AS longitude`,
      [req.user.id, name, skills, experienceYears, Boolean(coordinates), coordinates?.lng ?? null, coordinates?.lat ?? null],
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'User not found.' });
    return res.json({ user: publicUser(result.rows[0]) });
  } catch (error) {
    return next(error);
  }
}

module.exports = { authenticateToken, getCoordinates, getMe, login, publicUser, register, requireRole, updateMe };