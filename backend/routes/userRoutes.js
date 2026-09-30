const express = require('express');
const { getMe, login, register, authenticateToken, updateMe } = require('../controllers/userController');
const { offlineSync } = require('../middleware/offlineSync');

const router = express.Router();
router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.patch('/me', authenticateToken, updateMe);
router.post('/sync', authenticateToken, offlineSync);

module.exports = router;