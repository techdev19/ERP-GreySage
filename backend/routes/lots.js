const express = require('express');
const router = express.Router();
const { searchByLotNumber, searchByInvoiceNumber } = require('../controllers/lotController');
const { authenticateToken } = require('../middleware/auth');

router.get('/lots/search/lotNumber', authenticateToken, searchByLotNumber);
router.get('/lots/search/invoiceNumber', authenticateToken, searchByInvoiceNumber);

module.exports = router;