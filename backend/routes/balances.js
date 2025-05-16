const express = require('express');
const router = express.Router();
const { getBalance } = require('../controllers/balanceController');
const { authenticateToken } = require('../middleware/auth');

router.get('/balance/:period', authenticateToken, getBalance);

module.exports = router;