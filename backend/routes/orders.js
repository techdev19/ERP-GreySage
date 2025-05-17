const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getOrderById, updateOrderStatus } = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');

router.post('/orders', authenticateToken, createOrder);
router.put('/orders/:id/status', authenticateToken, updateOrderStatus);
router.get('/orders', authenticateToken, getOrders);
router.get('/orders/:id', authenticateToken, getOrderById);

module.exports = router;