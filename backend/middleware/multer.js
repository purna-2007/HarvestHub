const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDirectory = path.resolve(__dirname, '../uploads');
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDirectory),
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${Date.now()}-${require('crypto').randomUUID()}${extension}`);
  },
});

const imageUpload = multer({
  storage,
  limits: { fileSize: (Number(process.env.UPLOAD_MAX_MB) || 10) * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      const error = new Error('Only JPEG, PNG, and WebP images are accepted.');
      error.statusCode = 415;
      return callback(error);
    }
    return callback(null, true);
  },
});

module.exports = { imageUpload };