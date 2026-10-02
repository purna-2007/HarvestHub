
const db = require("../config/database");

// Supports both `module.exports = pool` and `module.exports = { pool }`
const pool = db.pool || db;

// Convert skills input into a clean array
const parseSkills = (skills) => {
  if (!skills) return [];

  if (Array.isArray(skills)) {
    return skills
      .map((skill) => String(skill).trim())
      .filter(Boolean);
  }

  if (typeof skills === "string") {
    try {
      const parsed = JSON.parse(skills);

      if (Array.isArray(parsed)) {
        return parsed
          .map((skill) => String(skill).trim())
          .filter(Boolean);
      }
    } catch (error) {
      // Treat normal comma-separated text as skills
    }

    return skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  }

  return [];
};

const calculateCosineSkillMatch = (requiredSkills, workerSkills) => {
  const required = [...new Set(
    parseSkills(requiredSkills).map((skill) => skill.toLowerCase())
  )];
  const worker = [...new Set(
    parseSkills(workerSkills).map((skill) => skill.toLowerCase())
  )];

  if (required.length === 0 || worker.length === 0) return 0;

  const workerSkillSet = new Set(worker);
  const sharedSkills = required.filter((skill) => workerSkillSet.has(skill)).length;
  return Number(
    ((sharedSkills / Math.sqrt(required.length * worker.length)) * 100).toFixed(2)
  );
};


// ==========================================
// REGISTER USER / SAVE WORKER PROFILE
// ==========================================

exports.registerUser = async (req, res) => {
  const {
    name,
    mobile,
    phone_number,
    password_hash = "",
    role,
    latitude,
    longitude,
    skills,
    experience_years = 0,
    village = null,
    expected_daily_wage = null
  } = req.body;

  const phone = String(mobile || phone_number || "").trim();

  if (!name || !phone || !["farmer", "worker"].includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Name, mobile and valid role are required."
    });
  }

  try {
    const parsedSkills = JSON.stringify(parseSkills(skills));

    // Check whether this mobile number already exists
    const [existingUsers] = await pool.execute(
      "SELECT id, role FROM users WHERE mobile = ? LIMIT 1",
      [phone]
    );

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];

      // Do not overwrite a different role
      if (existingUser.role !== role) {
        return res.status(409).json({
          success: false,
          message: "This mobile number is already registered with another role."
        });
      }

      // Update existing profile
      await pool.execute(
        `UPDATE users
         SET name = ?,
             skills = ?,
             experience_years = ?,
             latitude = ?,
             longitude = ?,
             village = ?,
             expected_daily_wage = ?,
             is_available = TRUE
         WHERE id = ?`,
        [
          name,
          parsedSkills,
          Number(experience_years) || 0,
          latitude ?? null,
          longitude ?? null,
          village,
          expected_daily_wage ? Number(expected_daily_wage) : null,
          existingUser.id
        ]
      );

      return res.json({
        success: true,
        message: "Existing profile updated successfully.",
        userId: existingUser.id
      });
    }

    // Create new user
    const [result] = await pool.execute(
      `INSERT INTO users
       (
         name,
         mobile,
         password_hash,
         role,
         skills,
         experience_years,
         latitude,
         longitude,
         village,
         expected_daily_wage
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        phone,
        password_hash,
        role,
        parsedSkills,
        Number(experience_years) || 0,
        latitude ?? null,
        longitude ?? null,
        village,
        expected_daily_wage ? Number(expected_daily_wage) : null
      ]
    );

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      userId: result.insertId
    });

  } catch (error) {
    console.error("Register user error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Could not save user."
    });
  }
};

exports.getWorkerProfile = async (req, res) => {
  const phone = String(req.params.mobile || '').replace(/\D/g, '').slice(-10);
  if (!/^[6-9]\d{9}$/.test(phone)) {
    return res.status(400).json({ success: false, message: 'A valid worker phone is required.' });
  }

  try {
    const [workers] = await pool.execute(
      `SELECT id,name,mobile,village,skills,experience_years,expected_daily_wage,latitude,longitude
       FROM users WHERE mobile=? AND role='worker' LIMIT 1`,
      [phone]
    );
    return res.json({ success: true, profile: workers[0] || null });
  } catch (error) {
    console.error('Get worker profile error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Could not load worker profile.'
    });
  }
};


// ==========================================
// SEARCH NEARBY WORKERS
// ==========================================

exports.searchWorkers = async (req, res) => {
  const { latitude, longitude, skill, location, max_daily_wage } = req.query;
  const hasLatitude = latitude !== undefined && latitude !== '';
  const hasLongitude = longitude !== undefined && longitude !== '';
  const hasCoordinates = hasLatitude && hasLongitude;
  const workerLocation = String(location || '').trim();
  const maxDailyWage = max_daily_wage === undefined || max_daily_wage === ''
    ? null
    : Number(max_daily_wage);

  if (hasLatitude !== hasLongitude) {
    return res.status(400).json({
      success: false,
      message: 'Latitude and longitude must be provided together.'
    });
  }

  if (!hasCoordinates && !workerLocation) {
    return res.status(400).json({
      success: false,
      message: 'A village/area or valid location coordinates are required.'
    });
  }

  const lat = hasCoordinates ? Number(latitude) : null;
  const lng = hasCoordinates ? Number(longitude) : null;
  if (hasCoordinates && (!Number.isFinite(lat) || !Number.isFinite(lng))) {
    return res.status(400).json({
      success: false,
      message: 'Invalid location coordinates.'
    });
  }

  if (maxDailyWage !== null &&
      (!Number.isFinite(maxDailyWage) || maxDailyWage <= 0)) {
    return res.status(400).json({
      success: false,
      message: 'Maximum daily wage must be a positive number.'
    });
  }

  try {
    let query = hasCoordinates
      ? `
      SELECT
        id,
        name,
        mobile,
        village,
        skills,
        experience_years,
        expected_daily_wage,
        latitude,
        longitude,
        (
          6371 * ACOS(
            LEAST(1, GREATEST(-1,
              COS(RADIANS(?)) *
              COS(RADIANS(latitude)) *
              COS(RADIANS(longitude) - RADIANS(?)) +
              SIN(RADIANS(?)) *
              SIN(RADIANS(latitude))
            ))
          )
        ) AS distance_km
      FROM users
      WHERE role = 'worker'
        AND is_available = TRUE
        AND latitude IS NOT NULL
        AND longitude IS NOT NULL
    `
      : `
      SELECT
        id,
        name,
        mobile,
        village,
        skills,
        experience_years,
        expected_daily_wage,
        latitude,
        longitude
      FROM users
      WHERE role = 'worker'
        AND is_available = TRUE
    `;

    const params = hasCoordinates ? [lat, lng, lat] : [];

    if (workerLocation) {
      query += ' AND LOWER(village) LIKE LOWER(?)';
      params.push(`%${workerLocation}%`);
    }

    if (maxDailyWage !== null) {
      query += ' AND expected_daily_wage IS NOT NULL AND expected_daily_wage <= ?';
      params.push(maxDailyWage);
    }

    query += hasCoordinates
      ? ' ORDER BY distance_km ASC'
      : ' ORDER BY expected_daily_wage ASC, name ASC';

    const [workers] = await pool.execute(query, params);
    const requestedSkills = parseSkills(skill);
    const rankedWorkers = workers
      .map((worker) => ({
        ...worker,
        skill_match_score: calculateCosineSkillMatch(
          requestedSkills,
          worker.skills
        )
      }))
      .filter((worker) =>
        requestedSkills.length === 0 || worker.skill_match_score > 0
      )
      .sort((first, second) =>
        second.skill_match_score - first.skill_match_score
      );

    return res.json({
      success: true,
      workers: rankedWorkers
    });

  } catch (error) {
    console.error("Search workers error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Could not search workers."
    });
  }
};


// ==========================================
// UPDATE EXISTING WORKER PROFILE
// ==========================================

exports.updateWorkerProfile = async (req, res) => {
  const {
    mobile,
    name,
    village,
    skills,
    experience_years,
    expected_daily_wage,
    latitude,
    longitude
  } = req.body;

  const phone = String(mobile || "").trim();

  if (!phone || !name || !village) {
    return res.status(400).json({
      success: false,
      message: "Mobile, name and village are required."
    });
  }

  try {
    const parsedSkills = JSON.stringify(parseSkills(skills));

    // Check whether worker already exists
    const [existingUsers] = await pool.execute(
      "SELECT id, role FROM users WHERE mobile = ? LIMIT 1",
      [phone]
    );

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];

      // Do not overwrite a farmer account
      if (existingUser.role !== "worker") {
        return res.status(409).json({
          success: false,
          message: "This mobile number is registered as a farmer."
        });
      }

      // Update existing worker profile
      await pool.execute(
        `UPDATE users
         SET name = ?,
             village = ?,
             skills = ?,
             experience_years = ?,
             expected_daily_wage = ?,
             latitude = ?,
             longitude = ?,
             is_available = TRUE
         WHERE id = ?`,
        [
          name,
          village,
          parsedSkills,
          Number(experience_years) || 0,
          Number(expected_daily_wage) || null,
          latitude ?? null,
          longitude ?? null,
          existingUser.id
        ]
      );

      return res.json({
        success: true,
        message: "Worker profile updated successfully.",
        userId: existingUser.id
      });
    }

    // If worker does not exist, create a new worker profile
    const [result] = await pool.execute(
      `INSERT INTO users
       (
         name,
         mobile,
         password_hash,
         role,
         village,
         skills,
         experience_years,
         expected_daily_wage,
         latitude,
         longitude,
         is_available
       )
       VALUES (?, ?, ?, 'worker', ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        name,
        phone,
        "",
        village,
        parsedSkills,
        Number(experience_years) || 0,
        Number(expected_daily_wage) || null,
        latitude ?? null,
        longitude ?? null
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Worker profile created successfully.",
      userId: result.insertId
    });

  } catch (error) {
    console.error("Update worker profile error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Could not save worker profile."
    });
  }
};