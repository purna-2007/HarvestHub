const express = require('express');
const { analyzeDisease } = require('../controllers/diseaseController');
const { imageUpload } = require('../middleware/multer');

const router = express.Router();
router.post('/analyze', imageUpload.single('image'), analyzeDisease);

module.exports = router;