const express = require('express');
const router = express.Router();
const { getVendorBalances, recordVendorPayment } = require('../controllers/vendorBalanceController');
const { authenticateToken } = require('../middleware/auth');

router.get('/vendor-balances', authenticateToken, getVendorBalances);
router.post('/vendor-balances/pay', authenticateToken, recordVendorPayment);

module.exports = router;