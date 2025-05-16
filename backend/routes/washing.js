const express = require('express');
const router = express.Router();
const { createWashing, updateWashing, getWashing } = require('../controllers/washingController');
const { authenticateToken } = require('../middleware/auth');

router.post('/washing', authenticateToken, createWashing);
router.put('/washing/:id', authenticateToken, updateWashing);
router.get('/washing', authenticateToken, getWashing);

module.exports = router;