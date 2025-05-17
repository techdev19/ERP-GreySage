const express = require('express');
const router = express.Router();
const { createStitching, updateStitching, getStitching } = require('../controllers/stitchingController');
const { authenticateToken } = require('../middleware/auth');

router.post('/stitching', authenticateToken, createStitching);
router.put('/stitching/:id', authenticateToken, updateStitching);
router.get('/stitching/', authenticateToken, getStitching);

module.exports = router;