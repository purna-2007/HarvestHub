const router = require('express').Router();
const c = require('../controllers/userController');
router.post('/register', c.registerUser);
router.get('/worker/:mobile', c.getWorkerProfile);
router.get('/workers/search', c.searchWorkers);
router.put('/profile/update', c.updateWorkerProfile);
module.exports = router;
