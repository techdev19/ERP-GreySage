const express = require('express');
const router = express.Router();
const { generateReport, getReports } = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/auth');

router.post('/reports', authenticateToken, generateReport);
router.get('/reports', authenticateToken, getReports);

module.exports = router;