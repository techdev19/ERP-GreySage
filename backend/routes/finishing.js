const express = require('express');
const router = express.Router();
const { createFinishing, updateFinishing, getFinishing } = require('../controllers/finishingController');
const { authenticateToken } = require('../middleware/auth');

router.post('/finishing', authenticateToken, createFinishing);
router.put('/finishing/:id', authenticateToken, updateFinishing);
router.get('/finishing', authenticateToken, getFinishing);

module.exports = router;