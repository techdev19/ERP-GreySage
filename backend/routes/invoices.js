const express = require('express');
const router = express.Router();
const { createInvoice, getInvoices } = require('../controllers/invoiceController');
const { authenticateToken } = require('../middleware/auth');

router.post('/invoices', authenticateToken, createInvoice);
router.get('/invoices', authenticateToken, getInvoices);

module.exports = router;