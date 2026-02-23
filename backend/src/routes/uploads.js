const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Ensure pdfs directory exists
const pdfsDir = path.join(__dirname, '../../uploads/pdfs');
if (!fs.existsSync(pdfsDir)) {
  fs.mkdirSync(pdfsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, pdfsDir),
  filename: (req, file, cb) => {
    const uniqueName = `proposta-${Date.now()}-${Math.round(Math.random() * 1e4)}.pdf`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Apenas PDFs são permitidos'));
  },
});

// POST /api/uploads/pdf
router.post('/pdf', upload.single('pdf'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Nenhum arquivo enviado' });
  const url = `/uploads/pdfs/${req.file.filename}`;
  res.json({ url, filename: req.file.filename });
});

module.exports = router;
