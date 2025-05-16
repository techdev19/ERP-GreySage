const { VendorBalance } = require('../mongodb_schema');
const { recordPayment } = require('../services/vendorBalanceService');
const { logAction } = require('../utils/logger');

const getVendorBalances = async (req, res) => {
  const { vendorType, vendorId } = req.query;
  const query = {};
  if (vendorType) query.vendorType = vendorType;
  if (vendorId) query.vendorId = vendorId;
  const balances = await VendorBalance.find(query).populate('vendorId orderId');
  res.json(balances);
};

const recordVendorPayment = async (req, res) => {
  const { vendorId, vendorType, lotNumber, amount } = req.body;
  await recordPayment(vendorId, vendorType, lotNumber, amount);
  await logAction(req.user.userId, `record_${vendorType}_payment`, 'VendorBalance', vendorId, `Recorded payment of ${amount} for ${vendorType} vendor`);
  res.json({ message: 'Payment recorded' });
};

module.exports = { getVendorBalances, recordVendorPayment };