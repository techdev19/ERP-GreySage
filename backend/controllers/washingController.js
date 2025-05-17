const { Washing, Order, Stitching } = require('../mongodb_schema');
const { updateVendorBalance } = require('../services/vendorBalanceService');
const { logAction } = require('../utils/logger');

const createWashing = async (req, res) => {
  const { lotNumber, orderId, invoiceNumber, vendorId, quantityShort, rate, date, washOutDate, description, washDetails } = req.body;

  // Validate required fields
  if (!lotNumber) return res.status(400).json({ error: 'Lot number is required' });
  if (!invoiceNumber) return res.status(400).json({ error: 'Invoice number is required' });

  // Validate washDetails quantities against StitchingSchema quantity
  const stitching = await Stitching.findOne({ lotNumber, orderId });
  if (!stitching) {
    return res.status(404).json({ error: 'Stitching record not found for this lot number and order' });
  }

  const totalWashQuantity = washDetails.reduce((sum, detail) => sum + detail.quantity, 0);
  if (totalWashQuantity !== stitching.quantity) {
    return res.status(400).json({ error: `Total quantity in washDetails (${totalWashQuantity}) must equal the stitching quantity (${stitching.quantity})` });
  }

  const washing = new Washing({
    lotNumber,
    orderId,
    invoiceNumber,
    vendorId,
    quantityShort,
    rate,
    date,
    washOutDate,
    description,
    washDetails,
    createdAt: new Date()
  });

  try {
    await washing.save();
    // Update the Order status to 3 (Order in Washing)
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status < 3) {
      order.status = 3;
      order.statusHistory.push({ status: 3, changedAt: new Date() });
      await order.save();
    }
    await updateVendorBalance(vendorId, 'washing', lotNumber, orderId, totalWashQuantity, rate);
    await logAction(req.user.userId, 'create_washing', 'Washing', washing._id, `Lot ${lotNumber} washed`);
    res.status(201).json(washing);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateWashing = async (req, res) => {
  const { washOutDate } = req.body;
  const washing = await Washing.findByIdAndUpdate(req.params.id, { washOutDate }, { new: true });
  if (!washing) return res.status(404).json({ error: 'Washing record not found' });
  await logAction(req.user.userId, 'update_washing', 'Washing', washing._id, 'Wash out date updated');
  res.json(washing);
};

const getWashing = async (req, res) => {
  const { search, orderId } = req.query;
  const query = {};
  if (search) query.lotNumber = { $regex: search, $options: 'i' };
  if (orderId) query.orderId = orderId;
  const washingRecords = await Washing.find(query).populate('orderId vendorId');
  res.json(washingRecords);
};

module.exports = { createWashing, updateWashing, getWashing };