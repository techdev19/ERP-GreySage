const express = require('express');
const router = express.Router();
const { createFitStyle, getFitStyles, toggleFitStyleActive } = require('../controllers/fitStyleController');
const { authenticateToken } = require('../middleware/auth');

router.post('/fitstyles', authenticateToken, createFitStyle);
router.get('/fitstyles', authenticateToken, getFitStyles);
router.put('/fitstyles/:id/toggle-active', authenticateToken, toggleFitStyleActive);

module.exports = router;