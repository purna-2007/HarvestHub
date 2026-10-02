const fs = require('fs/promises');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

async function analyzeDisease(req, res) {
  if (!req.file) return res.status(400).json({ error: 'Upload an image in the "image" field.' });
  const imagePath = path.resolve(req.file.path);
  try {
    const form = new FormData();
    form.append('image', require('fs').createReadStream(imagePath), {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
    const mlEngineUrl = (process.env.ML_ENGINE_URL || 'http://127.0.0.1:5000').replace(/\/$/, '');
    const endpoint = `${mlEngineUrl}${process.env.ML_PREDICT_PATH || '/predict_disease'}`;
    const response = await axios.post(endpoint, form, {
      headers: form.getHeaders(),
      timeout: 60000,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      validateStatus: (status) => status >= 200 && status < 500,
    });
    if (response.status >= 400) {
      return res.status(502).json({ error: 'The disease analysis service rejected the image.', details: response.data });
    }
    return res.status(response.status).json({ analysis: response.data });
  } catch (error) {
    if (error.response) return res.status(502).json({ error: 'The disease analysis service could not process the image.' });
    console.error('Disease analysis service request failed:', error);
    return res.status(502).json({ error: 'The disease analysis service could not be reached.' });
  } finally {
    await fs.unlink(imagePath).catch(() => {});
  }
}

module.exports = { analyzeDisease };