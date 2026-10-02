const { pool } = require('../config/database');
const asNum = v => (v === undefined || v === null || v === '' ? null : Number(v));

exports.createJob = async (req, res) => {
  const b = req.body;
  let farmerId = asNum(b.farmer_id);
  const farmerPhone = last10(b.farmer_phone);
  const lat = asNum(b.latitude), lon = asNum(b.longitude), wage = asNum(b.daily_wage ?? b.final_wage);
  const needed = Number(b.workers_needed || 1);
  if ((!farmerId && !/^[6-9]\d{9}$/.test(farmerPhone)) || !b.title || !wage || wage <= 0 || !Number.isInteger(needed) || needed < 1 ||
      lat === null || lon === null || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return res.status(400).json({ success: false, message: 'A valid farmer_id or farmer_phone, title, wage, workers_needed, latitude and longitude are required.' });
  }
  try {
    if (!farmerId) {
      const [users] = await pool.execute(
        "SELECT id FROM users WHERE mobile=? LIMIT 1",
        [farmerPhone]
      );
      if (users.length) {
        farmerId = users[0].id;
      } else {
        try {
          const [result] = await pool.execute(
            `INSERT INTO users (name,mobile,password_hash,role,skills)
             VALUES (?,?, '', 'farmer', JSON_ARRAY())`,
            ['Farmer', farmerPhone]
          );
          farmerId = result.insertId;
        } catch (error) {
          if (error.code !== 'ER_DUP_ENTRY') throw error;
          const [concurrentUsers] = await pool.execute(
            "SELECT id FROM users WHERE mobile=? LIMIT 1",
            [farmerPhone]
          );
          if (!concurrentUsers.length) throw error;
          farmerId = concurrentUsers[0].id;
        }
      }
    }
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
    if (io) {
      io.emit('new_job', job);
      io.emit('notify_worker', job);
    }
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

exports.getFarmerJobsByPhone = async (req, res) => {
  const farmerPhone = last10(req.params.farmerPhone);
  if (!farmerPhone) return res.status(400).json({ success: false, message: 'A valid farmer phone is required.' });
  try {
    const [rows] = await pool.execute(
      `SELECT j.*, u.name AS farmer_name, u.mobile AS farmer_phone,
       w.name AS worker_name, w.mobile AS worker_phone,
       (SELECT COUNT(*) FROM job_applications a WHERE a.job_id=j.id AND a.status='pending') AS pending_applications
       FROM jobs j
       JOIN users u ON u.id=j.farmer_id
       LEFT JOIN users w ON w.id=j.accepted_worker_id
       WHERE u.mobile=?
       ORDER BY j.created_at DESC`,
      [farmerPhone]
    );
    res.json({ success: true, jobs: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getJobApplications = async (req, res) => {
  const jobId = Number(req.params.jobId);
  const farmerPhone = last10(req.query.farmer_phone);
  if (!jobId || !farmerPhone) {
    return res.status(400).json({ success: false, message: 'A valid job id and farmer phone are required.' });
  }
  try {
    const [jobs] = await pool.execute(
      `SELECT j.id FROM jobs j JOIN users f ON f.id=j.farmer_id
       WHERE j.id=? AND f.mobile=?`,
      [jobId, farmerPhone]
    );
    if (!jobs.length) return res.status(404).json({ success: false, message: 'Job not found for this farmer.' });

    const [applications] = await pool.execute(
      `SELECT a.id AS application_id,a.job_id,a.worker_id,a.agreed_wage,a.status,a.applied_at,
       w.name AS worker_name,w.mobile AS worker_phone,w.village AS worker_village,
       w.skills AS worker_skills,w.experience_years AS worker_experience_years
       FROM job_applications a JOIN users w ON w.id=a.worker_id
       WHERE a.job_id=? ORDER BY a.applied_at DESC`,
      [jobId]
    );
    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.searchWorkerApplicants = async (req, res) => {
  const cropType = String(req.query.crop_type || '').trim();
  const requiredSkill = String(req.query.required_skill || '').trim();
  const location = String(req.query.location || '').trim();
  const maxDailyWage = req.query.max_daily_wage === undefined || req.query.max_daily_wage === ''
    ? null
    : Number(req.query.max_daily_wage);

  if (!cropType || !requiredSkill || !location ||
      (maxDailyWage !== null && (!Number.isFinite(maxDailyWage) || maxDailyWage <= 0))) {
    return res.status(400).json({
      success: false,
      message: 'Crop type, required skill, location and a valid optional daily wage are required.'
    });
  }

  try {
    let query = `
      SELECT a.id AS application_id,a.job_id,a.worker_id,a.agreed_wage,a.status,a.applied_at,
        j.title AS job_title,j.crop_type,j.required_skill,
        w.name AS worker_name,w.mobile AS worker_phone,w.village AS worker_village,
        w.skills AS worker_skills,w.experience_years AS worker_experience_years,
        w.expected_daily_wage AS worker_expected_daily_wage,
        COALESCE(NULLIF(w.expected_daily_wage,0),a.agreed_wage) AS worker_daily_wage
      FROM job_applications a
      JOIN jobs j ON j.id=a.job_id
      JOIN users w ON w.id=a.worker_id
      WHERE a.status='pending'
        AND j.status='open'
        AND w.role='worker'
        AND LOWER(TRIM(j.crop_type))=LOWER(?)
        AND LOWER(TRIM(j.required_skill))=LOWER(?)
        AND LOWER(w.village) LIKE LOWER(?)
    `;
    const params = [cropType, requiredSkill, `%${location}%`];

    if (maxDailyWage !== null) {
      query += ` AND COALESCE(NULLIF(w.expected_daily_wage,0),a.agreed_wage)<=?`;
      params.push(maxDailyWage);
    }
    query += ' ORDER BY a.applied_at DESC';

    const [applications] = await pool.execute(query, params);
    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getWorkerApplications = async (req, res) => {
  const workerPhone = last10(req.params.workerPhone);
  if (!workerPhone) return res.status(400).json({ success: false, message: 'A valid worker phone is required.' });
  try {
    const [applications] = await pool.execute(
      `SELECT a.id AS application_id,a.job_id,a.worker_id,a.agreed_wage,a.status,a.applied_at,a.decided_at,a.completed_at,
       j.title,j.crop_type,j.required_skill,j.location_name,j.start_date,j.status AS job_status,
       f.name AS farmer_name,f.mobile AS farmer_phone
       FROM job_applications a
       JOIN users w ON w.id=a.worker_id
       JOIN jobs j ON j.id=a.job_id
       JOIN users f ON f.id=j.farmer_id
       WHERE w.mobile=? AND w.role='worker'
       ORDER BY a.applied_at DESC`,
      [workerPhone]
    );
    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.applyForJob = async (req, res) => {
  const jobId = Number(req.params.jobId);
  const workerPhone = last10(req.body.worker_phone);
  const agreedWage = asNum(req.body.agreed_wage);
  if (!jobId || !workerPhone) {
    return res.status(400).json({ success: false, message: 'A valid job id and worker phone are required.' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [jobs] = await connection.execute(
      `SELECT j.*,f.mobile AS farmer_phone FROM jobs j JOIN users f ON f.id=j.farmer_id WHERE j.id=? FOR UPDATE`,
      [jobId]
    );
    if (!jobs.length || jobs[0].status !== 'open') {
      await connection.rollback();
      return res.status(409).json({ success: false, message: 'This job is no longer accepting applications.' });
    }
    const [workers] = await connection.execute(
      "SELECT id,name,mobile FROM users WHERE mobile=? AND role='worker' LIMIT 1",
      [workerPhone]
    );
    if (!workers.length) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Worker profile not found.' });
    }
    const worker = workers[0];
    const [existing] = await connection.execute(
      'SELECT id,status FROM job_applications WHERE job_id=? AND worker_id=?',
      [jobId, worker.id]
    );
    if (existing.length) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: 'You have already applied for this job.',
        application: { application_id: existing[0].id, status: existing[0].status }
      });
    }
    const wage = agreedWage && agreedWage > 0 ? agreedWage : Number(jobs[0].daily_wage);
    const [result] = await connection.execute(
      "INSERT INTO job_applications (job_id,worker_id,agreed_wage,status) VALUES (?,?,?,'pending')",
      [jobId, worker.id, wage]
    );
    await connection.commit();

    const application = {
      application_id: result.insertId,
      job_id: jobId,
      worker_id: worker.id,
      worker_name: worker.name,
      worker_phone: worker.mobile,
      farmer_phone: jobs[0].farmer_phone,
      title: jobs[0].title,
      crop_type: jobs[0].crop_type,
      required_skill: jobs[0].required_skill,
      agreed_wage: wage,
      status: 'pending'
    };
    const io = req.app.get('io');
    if (io) io.to(`farmer:${last10(application.farmer_phone)}`).emit('job_application', application);
    res.status(201).json({ success: true, message: 'Job application submitted.', application });
  } catch (error) {
    await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'You have already applied for this job.' });
    }
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

exports.decideApplication = async (req, res) => {
  const jobId = Number(req.params.jobId);
  const applicationId = Number(req.params.applicationId);
  const farmerPhone = last10(req.body.farmer_phone);
  const decision = String(req.body.decision || '').toLowerCase();
  if (!jobId || !applicationId || !farmerPhone || !['accept', 'reject'].includes(decision)) {
    return res.status(400).json({ success: false, message: 'Valid job, application, farmer phone, and accept/reject decision are required.' });
  }

  const connection = await pool.getConnection();
  let workerPhone;
  let farmer;
  try {
    await connection.beginTransaction();
    const [jobs] = await connection.execute(
      `SELECT j.*,f.mobile AS farmer_phone FROM jobs j JOIN users f ON f.id=j.farmer_id
       WHERE j.id=? AND f.mobile=? FOR UPDATE`,
      [jobId, farmerPhone]
    );
    if (!jobs.length) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Job not found for this farmer.' });
    }
    const job = jobs[0];
    if (job.status !== 'open') {
      await connection.rollback();
      return res.status(409).json({ success: false, message: 'This job has already been assigned or closed.' });
    }
    const [applications] = await connection.execute(
      `SELECT a.*,w.name AS worker_name,w.mobile AS worker_phone,w.village AS worker_village,
       w.skills AS worker_skills,w.experience_years AS worker_experience_years
       FROM job_applications a JOIN users w ON w.id=a.worker_id
       WHERE a.id=? AND a.job_id=? FOR UPDATE`,
      [applicationId, jobId]
    );
    if (!applications.length || applications[0].status !== 'pending') {
      await connection.rollback();
      return res.status(409).json({ success: false, message: 'This application is no longer pending.' });
    }
    const application = applications[0];
    workerPhone = application.worker_phone;
    farmer = job.farmer_phone;

    if (decision === 'accept') {
      await connection.execute(
        "UPDATE jobs SET status='accepted',accepted_worker_id=?,accepted_at=NOW() WHERE id=?",
        [application.worker_id, jobId]
      );
      await connection.execute(
        "UPDATE job_applications SET status=IF(id=?,'accepted','rejected'),decided_at=NOW() WHERE job_id=? AND status='pending'",
        [applicationId, jobId]
      );
      await connection.execute(
        'INSERT INTO job_acceptances (job_id,worker_id,agreed_wage) VALUES (?,?,?)',
        [jobId, application.worker_id, application.agreed_wage]
      );
    } else {
      await connection.execute(
        "UPDATE job_applications SET status='rejected',decided_at=NOW() WHERE id=? AND status='pending'",
        [applicationId]
      );
    }

    await connection.commit();
    const status = decision === 'accept' ? 'accepted' : 'rejected';
    const responseApplication = {
      application_id: applicationId,
      job_id: jobId,
      job_title: job.title,
      crop_type: job.crop_type,
      required_skill: job.required_skill,
      worker_id: application.worker_id,
      worker_name: application.worker_name,
      worker_phone: application.worker_phone,
      worker_village: application.worker_village,
      worker_skills: application.worker_skills,
      worker_experience_years: application.worker_experience_years,
      farmer_phone: job.farmer_phone,
      agreed_wage: application.agreed_wage,
      status
    };
    const io = req.app.get('io');
    if (io) {
      io.to(`worker:${last10(workerPhone)}`).emit('application_status', responseApplication);
      if (decision === 'accept') {
        io.to(`farmer:${last10(farmer)}`).emit('notify_farmer', {
          ...responseApplication,
          daily_wage: application.agreed_wage,
          title: job.title
        });
        const [otherWorkers] = await pool.execute(
          "SELECT w.mobile FROM job_applications a JOIN users w ON w.id=a.worker_id WHERE a.job_id=? AND a.status='rejected'",
          [jobId]
        );
        otherWorkers.forEach((worker) => {
          if (last10(worker.mobile) !== last10(workerPhone)) {
            io.to(`worker:${last10(worker.mobile)}`).emit('application_status', {
              job_id: jobId,
              job_title: job.title,
              status: 'rejected'
            });
          }
        });
      }
    }
    res.json({ success: true, application: responseApplication });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

exports.completeJob = async (req, res) => {
  const applicationId = Number(req.params.applicationId);
  const workerPhone = last10(req.body.worker_phone);
  if (!applicationId || !workerPhone) {
    return res.status(400).json({ success: false, message: 'A valid application id and worker phone are required.' });
  }
  try {
    const [result] = await pool.execute(
      `UPDATE job_applications a
       JOIN users w ON w.id=a.worker_id
       JOIN jobs j ON j.id=a.job_id
       SET a.status='completed',a.completed_at=NOW(),j.status='closed'
       WHERE a.id=? AND w.mobile=? AND a.status='accepted' AND j.status='accepted' AND j.accepted_worker_id=a.worker_id`,
      [applicationId, workerPhone]
    );
    if (!result.affectedRows) {
      return res.status(409).json({ success: false, message: 'Only the accepted worker can complete an active job.' });
    }
    const [rows] = await pool.execute(
      `SELECT a.id AS application_id,a.job_id,a.status,j.title AS job_title,f.mobile AS farmer_phone
       FROM job_applications a JOIN jobs j ON j.id=a.job_id JOIN users f ON f.id=j.farmer_id
       WHERE a.id=?`,
      [applicationId]
    );
    const completed = rows[0];
    const io = req.app.get('io');
    if (io) {
      io.to(`worker:${workerPhone}`).emit('application_status', completed);
      io.to(`farmer:${last10(completed.farmer_phone)}`).emit('job_completed', completed);
    }
    res.json({ success: true, application: completed });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.acceptJob = async (req, res) => {
  const jobId = Number(req.params.jobId);
  const workerId = Number(req.body.worker_id);
  const workerPhone = String(req.body.worker_phone || '').replace(/\D/g, '').slice(-10);
  const agreedWage = asNum(req.body.agreed_wage ?? req.body.final_wage);
  if (!jobId || ((!Number.isSafeInteger(workerId) || workerId <= 0) && !workerPhone)) {
    return res.status(400).json({ success: false, message: 'jobId and a valid worker_id or worker_phone are required.' });
  }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [jobs] = await connection.execute('SELECT * FROM jobs WHERE id=? FOR UPDATE', [jobId]);
    if (!jobs.length || jobs[0].status !== 'open') {
      await connection.rollback();
      return res.status(409).json({ success: false, message: 'Job is not available.' });
    }
    const job = jobs[0];
    const [workers] = Number.isSafeInteger(workerId) && workerId > 0
      ? await connection.execute("SELECT id,name,mobile,village,skills,experience_years FROM users WHERE id=? AND role='worker'", [workerId])
      : await connection.execute("SELECT id,name,mobile,village,skills,experience_years FROM users WHERE mobile=? AND role='worker'", [workerPhone]);
    if (!workers.length) { await connection.rollback(); return res.status(404).json({ success:false, message:'Worker not found.' }); }
    const acceptedWorkerId = workers[0].id;
    const wage = agreedWage && agreedWage > 0 ? agreedWage : Number(job.daily_wage);
    await connection.execute("UPDATE jobs SET status='accepted',accepted_worker_id=?,accepted_at=NOW() WHERE id=?", [acceptedWorkerId, jobId]);
    await connection.execute('INSERT INTO job_acceptances (job_id,worker_id,agreed_wage) VALUES (?,?,?)', [jobId, acceptedWorkerId, wage]);
    await connection.commit();
    const [farmerRows] = await pool.execute('SELECT id,name,mobile FROM users WHERE id=?', [job.farmer_id]);
    const accepted = { job_id: jobId, job_title: job.title, crop_type: job.crop_type, required_skill: job.required_skill,
      daily_wage: wage, worker_id: acceptedWorkerId, worker_name: workers[0].name, worker_phone: workers[0].mobile,
      worker_village: workers[0].village, worker_skills: workers[0].skills,
      worker_experience_years: workers[0].experience_years,
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
