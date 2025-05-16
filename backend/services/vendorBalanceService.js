const { VendorBalance } = require('../mongodb_schema');

const updateVendorBalance = async (vendorId, vendorType, lotNumber, orderId, quantity, rate) => {
  const totalAmount = quantity * rate;
  await VendorBalance.findOneAndUpdate(
    { vendorId, vendorType, lotNumber, orderId },
    {
      $inc: { totalAmount, remainingBalance: totalAmount },
      $set: { lastUpdated: new Date() }
    },
    { upsert: true }
  );
};

const recordPayment = async (vendorId, vendorType, lotNumber, amount) => {
  await VendorBalance.findOneAndUpdate(
    { vendorId, vendorType, lotNumber },
    {
      $inc: { paymentsMade: amount, remainingBalance: -amount },
      $set: { lastUpdated: new Date() }
    }
  );
};

module.exports = { updateVendorBalance, recordPayment };