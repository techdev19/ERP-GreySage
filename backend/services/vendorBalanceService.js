const { VendorBalance } = require('../mongodb_schema');

const updateVendorBalance = async (vendorId, vendorType, lotId, orderId, quantity, rate) => {
  try {
    const totalAmount = quantity * rate;

    // Find or create VendorBalance entry
    let balance = await VendorBalance.findOne({
      vendorId,
      vendorType,
      orderId,
      lotId,
    });

    if (!balance) {
      balance = new VendorBalance({
        vendorId,
        vendorType,
        orderId,
        lotId,
        totalAmount,
        paymentsMade: 0,
        remainingBalance: totalAmount,
        lastUpdated: new Date(),
      });
    } else {
      balance.totalAmount += totalAmount;
      balance.remainingBalance = balance.totalAmount - balance.paymentsMade;
      balance.lastUpdated = new Date();
    }

    await balance.save();
    return balance;
  } catch (error) {
    throw new Error(`Failed to update vendor balance: ${error.message}`);
  }
};

module.exports = { updateVendorBalance };