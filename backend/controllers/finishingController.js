const { Finishing, Order } = require('../mongodb_schema');
const { updateVendorBalance } = require('../services/vendorBalanceService');
const { logAction } = require('../utils/logger');

const createFinishing = async (req, res) => {
  const { lotNumber, orderId, vendorId, quantity, quantityShort, rate, date, finishOutDate, description } = req.body;
  const finishing = new Finishing({
    lotNumber,
    orderId,
    vendorId,
    quantity,
    quantityShort,
    rate,
    date,
    finishOutDate,
    description,
    createdAt: new Date()
  });
  try {
    await finishing.save();
    // Update the Order status to 4 (Order in Finishing)
    const order = await Order.findById(orderId);
    if (order && order.status < 4) {
      order.status = 4;
      order.statusHistory.push({ status: 4, changedAt: new Date() });
      await order.save();
    }
    await updateVendorBalance(vendorId, 'finishing', lotNumber, orderId, quantity, rate);
    await logAction(req.user.userId, 'create_finishing', 'Finishing', finishing._id, `Lot ${lotNumber} finished`);
    res.status(201).json(finishing);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateFinishing = async (req, res) => {
  const { finishOutDate } = req.body;
  const finishing = await Finishing.findByIdAndUpdate(req.params.id, { finishOutDate }, { new: true });
  // Update the Order status to 5 (Order Complete) if finishOutDate is set
  const order = await Order.findById(finishing.orderId);
  if (order && finishOutDate && order.status < 5) {
    order.status = 5;
    order.statusHistory.push({ status: 5, changedAt: new Date() });
    await order.save();
  }
  await logAction(req.user.userId, 'update_finishing', 'Finishing', finishing._id, 'Finish out date updated, ready for shipment');
  res.json(finishing);
};

const getFinishing = async (req, res) => {
  const { search } = req.query;
  const query = search ? { lotNumber: { $regex: search, $options: 'i' } } : {};
  const finishingRecords = await Finishing.find(query).populate('orderId vendorId');
  res.json(finishingRecords);
};

module.exports = { createFinishing, updateFinishing, getFinishing };