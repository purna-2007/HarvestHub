const router = require('express').Router();
const c = require('../controllers/jobController');
router.post('/create', c.createJob);
router.get('/feed', c.getNearbyJobs);
router.get('/farmer/:farmerId', c.getFarmerJobs);
router.post('/:jobId/accept', c.acceptJob);
module.exports = router;
