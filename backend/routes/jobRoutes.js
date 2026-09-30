const express = require('express');
const { createJob, getJob, getMatches, listJobs, updateJob } = require('../controllers/jobController');
const { authenticateToken, requireRole } = require('../controllers/userController');

const router = express.Router();
router.get('/', listJobs);
router.get('/matches', authenticateToken, requireRole('worker'), getMatches);
router.get('/:id', getJob);
router.post('/', authenticateToken, requireRole('farmer'), createJob);
router.patch('/:id', authenticateToken, requireRole('farmer'), updateJob);

module.exports = router;