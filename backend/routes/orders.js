const express = require('express');
const router = express.Router();
const { createOrder, getOrders, updateOrderStatus } = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');

router.post('/orders', authenticateToken, createOrder);
router.get('/orders', authenticateToken, getOrders);
router.put('/orders/:id/status', authenticateToken, updateOrderStatus);

module.exports = router;