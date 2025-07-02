const express = require('express');
const router = express.Router();
const { createOrder, updateOrder, getOrders, getOrderById, updateOrderStatus } = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');

router.post('/orders', authenticateToken, createOrder);
router.post('/orders-update/:id', authenticateToken, updateOrder);
router.put('/orders/:id/status', authenticateToken, updateOrderStatus);
router.get('/orders', authenticateToken, getOrders);
router.get('/orders/:id', authenticateToken, getOrderById);

module.exports = router;