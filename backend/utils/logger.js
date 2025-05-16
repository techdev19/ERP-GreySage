const { AuditLog } = require('../mongodb_schema');

const logAction = async (userId, action, entity, entityId, details) => {
  const auditLog = new AuditLog({ userId, action, entity, entityId, details });
  await auditLog.save();
};

module.exports = { logAction };