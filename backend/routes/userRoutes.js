const router = require('express').Router();
const c = require('../controllers/userController');
router.post('/register', c.registerUser);
router.get('/workers/search', c.searchWorkers);
router.put('/profile/update', c.updateWorkerProfile);
module.exports = router;
