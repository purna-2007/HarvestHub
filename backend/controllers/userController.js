const pool = require("../config/database");

exports.registerUser = async (req, res) => {
  const { name, phone_number, role, latitude, longitude, skills, experience_years } = req.body;

  try {
    // 1. Insert into base shared Users table
    const userResult = await pool.query(
      "INSERT INTO users (name, phone_number, role) VALUES (\$1, \$2, \$3) RETURNING id;",
      [name, phone_number, role]
    );
    const userId = userResult.rows[0].id;

    // 2. Insert into specific profile table based on application identity role
    if (role === "farmer") {
      await pool.query(
        `INSERT INTO farmers (farmer_id, farm_location, trust_score) 
         VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326), 5.0);`,
        [userId, longitude, latitude]
      );
    } else if (role === "worker") {
      await pool.query(
        `INSERT INTO workers (worker_id, skills, home_location, experience_years, trust_score, is_available) 
         VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326), $5, 5.0, true);`,
        [userId, skills || [], longitude, latitude, experience_years || 0]
      );
    }

    return res.status(201).json({ success: true, message: "User profile registered successfully!", userId });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
