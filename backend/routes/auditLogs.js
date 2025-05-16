const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditLogController');
const { authenticateToken, restrictTo } = require('../middleware/auth');

router.get('/audit-logs', authenticateToken, restrictTo('admin'), getAuditLogs);

module.exports = router;