const { pool } = require('../config/database');
const asNum = v => (v === undefined || v === null || v === '' ? null : Number(v));

exports.createJob = async (req, res) => {
  const b = req.body;
  const farmerId = asNum(b.farmer_id);
  const lat = asNum(b.latitude), lon = asNum(b.longitude), wage = asNum(b.daily_wage ?? b.final_wage);
  const needed = Number(b.workers_needed || 1);
  if (!farmerId || !b.title || !wage || wage <= 0 || !Number.isInteger(needed) || needed < 1 ||
      lat === null || lon === null || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return res.status(400).json({ success: false, message: 'Valid farmer_id, title, wage, workers_needed, latitude and longitude are required.' });
  }
  try {
    const [result] = await pool.execute(
      `INSERT INTO jobs (farmer_id,title,description,crop_type,required_skill,workers_needed,daily_wage,start_date,location_name,latitude,longitude,status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,'open')`,
      [farmerId, b.title, b.description || '', b.crop_type || null, b.required_skill || null, needed, wage,
       b.start_date || null, b.location_name || b.village || null, lat, lon]
    );
    const [rows] = await pool.execute(
      `SELECT j.*, u.name AS farmer_name, u.mobile AS farmer_phone FROM jobs j JOIN users u ON u.id=j.farmer_id WHERE j.id=?`,
      [result.insertId]
    );
    const job = rows[0];
    const io = req.app.get('io');
    if (io) io.emit('new_job', job);
    res.status(201).json({ success: true, message: 'Job created.', job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getNearbyJobs = async (req, res) => {
  const lat = asNum(req.query.latitude), lon = asNum(req.query.longitude);
  if (lat === null || lon === null) return res.status(400).json({ success: false, message: 'latitude and longitude are required.' });
  try {
    const [rows] = await pool.execute(
      `SELECT j.id,j.farmer_id,j.title,j.description,j.crop_type,j.required_skill,j.workers_needed,j.daily_wage,j.status,j.start_date,j.location_name,j.latitude,j.longitude,j.created_at,
       u.name AS farmer_name,u.mobile AS farmer_phone,
       (6371 * ACOS(LEAST(1,GREATEST(-1,COS(RADIANS(?))*COS(RADIANS(j.latitude))*COS(RADIANS(j.longitude)-RADIANS(?))+SIN(RADIANS(?))*SIN(RADIANS(j.latitude)))))) AS distance_km
       FROM jobs j JOIN users u ON u.id=j.farmer_id WHERE j.status='open' ORDER BY distance_km ASC, j.created_at DESC`, [lat, lon, lat]
    );
    res.json({ success: true, jobs: rows.map(j => ({ ...j, distance_km: Number(j.distance_km) })) });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getFarmerJobs = async (req, res) => {
  const farmerId = Number(req.params.farmerId);
  if (!farmerId) return res.status(400).json({ success: false, message: 'Valid farmerId required.' });
  try {
    const [rows] = await pool.execute(
      `SELECT j.*, u.name AS farmer_name, u.mobile AS farmer_phone, w.name AS worker_name, w.mobile AS worker_phone
       FROM jobs j JOIN users u ON u.id=j.farmer_id LEFT JOIN users w ON w.id=j.accepted_worker_id
       WHERE j.farmer_id=? ORDER BY j.created_at DESC`, [farmerId]);
    res.json({ success: true, jobs: rows });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.acceptJob = async (req, res) => {
  const jobId = Number(req.params.jobId);
  const workerId = Number(req.body.worker_id);
  const agreedWage = asNum(req.body.agreed_wage ?? req.body.final_wage);
  if (!jobId || !workerId) return res.status(400).json({ success: false, message: 'jobId and worker_id are required.' });
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [jobs] = await connection.execute('SELECT * FROM jobs WHERE id=? FOR UPDATE', [jobId]);
    if (!jobs.length || jobs[0].status !== 'open') {
      await connection.rollback();
      return res.status(409).json({ success: false, message: 'Job is not available.' });
    }
    const job = jobs[0];
    const [workers] = await connection.execute("SELECT id,name,mobile FROM users WHERE id=? AND role='worker'", [workerId]);
    if (!workers.length) { await connection.rollback(); return res.status(404).json({ success:false, message:'Worker not found.' }); }
    const wage = agreedWage && agreedWage > 0 ? agreedWage : Number(job.daily_wage);
    await connection.execute("UPDATE jobs SET status='accepted',accepted_worker_id=?,accepted_at=NOW() WHERE id=?", [workerId, jobId]);
    await connection.execute('INSERT INTO job_acceptances (job_id,worker_id,agreed_wage) VALUES (?,?,?)', [jobId, workerId, wage]);
    await connection.commit();
    const [farmerRows] = await pool.execute('SELECT id,name,mobile FROM users WHERE id=?', [job.farmer_id]);
    const accepted = { job_id: jobId, job_title: job.title, crop_type: job.crop_type, required_skill: job.required_skill,
      daily_wage: wage, worker_id: workerId, worker_name: workers[0].name, worker_phone: workers[0].mobile,
      farmer_id: job.farmer_id, farmer_phone: farmerRows[0]?.mobile, status: 'accepted' };
    const io = req.app.get('io');
    if (io && accepted.farmer_phone) io.to(`farmer:${last10(accepted.farmer_phone)}`).emit('notify_farmer', accepted);
    res.json({ success: true, message: 'Job accepted and saved.', acceptedJob: accepted });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally { connection.release(); }
};
function last10(phone) { return String(phone || '').replace(/\D/g, '').slice(-10); }
