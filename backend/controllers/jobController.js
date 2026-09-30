const pool = require("../config/database");
const axios = require("axios");

exports.createJob = async (req, res) => {
  const { farmer_id, crop_type, required_skill, workers_needed, latitude, longitude } = req.body;

  try {
    // Call your local Python ML server to get the dynamic fair-wage recommendation
    let suggestedWage = 450; // Fallback value
    try {
      const mlResponse = await axios.post("http://localhost:5000/predict_wage", {
        demanded: 120, // Example real-time seasonal metric parameters
        supplied: 60,
        rainfall: 25.0
      });
      suggestedWage = mlResponse.data.suggested_wage;
    } catch (mlErr) {
      console.log("⚠️ Python ML Server offline, serving default baseline calculation.");
    }

    // Save the job tracking record with its spatial footprint location
    const jobResult = await pool.query(
      `INSERT INTO jobs (farmer_id, crop_type, required_skill, workers_needed, suggested_wage, final_wage, job_location, status)
       VALUES ($1, $2, $3, $4, $5, $5, ST_SetSRID(ST_MakePoint($6, $7), 4326), 'open') RETURNING *;`,
      [farmer_id, crop_type, required_skill, workers_needed, suggestedWage, longitude, latitude]
    );

    return res.status(201).json({ success: true, job: jobResult.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.getNearbyJobs = async (req, res) => {
  const { worker_id, latitude, longitude } = req.query;

  try {
    // Spatial search: Find open jobs and calculate distance using PostGIS ST_DistanceSphere
    const jobsResult = await pool.query(
      `SELECT id, crop_type, required_skill, final_wage,
       ST_DistanceSphere(job_location, ST_SetSRID(ST_MakePoint($1, $2), 4326)) / 1000 AS distance_km
       FROM jobs WHERE status = 'open'
       ORDER BY distance_km ASC;`,
      [longitude, latitude]
    );

    return res.status(200).json({ success: true, jobs: jobsResult.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
