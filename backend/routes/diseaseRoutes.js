const express = require('express');
const { analyzeDisease } = require('../controllers/diseaseController');
const { imageUpload } = require('../middleware/multer');

const router = express.Router();
const uploadDiseaseImage = (req, res, next) => {
  imageUpload.single('image')(req, res, (error) => {
    if (!error) return next();

    const statusCode = error.statusCode || (error.code === 'LIMIT_FILE_SIZE' ? 413 : 400);
    const message = error.code === 'LIMIT_FILE_SIZE'
      ? 'Image must be 10 MB or smaller.'
      : error.message;

    return res.status(statusCode).json({ error: message });
  });
};

router.post('/analyze', uploadDiseaseImage, analyzeDisease);

module.exports = router;