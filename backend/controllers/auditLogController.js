const { AuditLog } = require('../mongodb_schema');

const getAuditLogs = async (req, res) => {
  const logs = await AuditLog.find().populate('userId');
  res.json(logs);
};

module.exports = { getAuditLogs };