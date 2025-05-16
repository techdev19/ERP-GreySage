const { Washing, Order } = require('../mongodb_schema');
const { updateVendorBalance } = require('../services/vendorBalanceService');
const { logAction } = require('../utils/logger');

const createWashing = async (req, res) => {
  const { lotNumber, orderId, vendorId, quantity, quantityShort, rate, date, washOutDate, description } = req.body;
  const washing = new Washing({
    lotNumber,
    orderId,
    vendorId,
    quantity,
    quantityShort,
    rate,
    date,
    washOutDate,
    description,
    createdAt: new Date()
  });
  try {
    await washing.save();
    // Update the Order status to 3 (Order in Washing)
    const order = await Order.findById(orderId);
    if (order && order.status < 3) {
      order.status = 3;
      order.statusHistory.push({ status: 3, changedAt: new Date() });
      await order.save();
    }
    await updateVendorBalance(vendorId, 'washing', lotNumber, orderId, quantity, rate);
    await logAction(req.user.userId, 'create_washing', 'Washing', washing._id, `Lot ${lotNumber} washed`);
    res.status(201).json(washing);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateWashing = async (req, res) => {
  const { washOutDate } = req.body;
  const washing = await Washing.findByIdAndUpdate(req.params.id, { washOutDate }, { new: true });
  await logAction(req.user.userId, 'update_washing', 'Washing', washing._id, 'Wash out date updated');
  res.json(washing);
};

const getWashing = async (req, res) => {
  const { search } = req.query;
  const query = search ? { lotNumber: { $regex: search, $options: 'i' } } : {};
  const washingRecords = await Washing.find(query).populate('orderId vendorId');
  res.json(washingRecords);
};

module.exports = { createWashing, updateWashing, getWashing };