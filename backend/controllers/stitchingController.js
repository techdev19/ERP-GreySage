const { Stitching, Order } = require('../mongodb_schema');
const { generateLotNumber } = require('../services/lotNumberService');
const { updateVendorBalance } = require('../services/vendorBalanceService');
const { logAction } = require('../utils/logger');

const createStitching = async (req, res) => {
  const { orderId, startBatch, endBatch, vendorId, waistSizes, quantity, quantityShort, rate, date, stitchOutDate, description } = req.body;
  const lotNumber = await generateLotNumber(orderId, startBatch, endBatch);
  const stitching = new Stitching({
    lotNumber,
    orderId,
    vendorId,
    waistSizes,
    quantity,
    quantityShort,
    rate,
    date,
    stitchOutDate,
    description,
    createdAt: new Date()
  });
  try {
    await stitching.save();
    // Update the Order status to 2 (Order in Stitching)
    const order = await Order.findById(orderId);
    if (order && order.status < 2) {
      order.status = 2;
      order.statusHistory.push({ status: 2, changedAt: new Date() });
      await order.save();
    }
    await updateVendorBalance(vendorId, 'stitching', lotNumber, orderId, quantity, rate);
    await logAction(req.user.userId, 'create_stitching', 'Stitching', stitching._id, `Lot ${lotNumber} created`);
    res.status(201).json(stitching);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateStitching = async (req, res) => {
  const { stitchOutDate } = req.body;
  const stitching = await Stitching.findByIdAndUpdate(req.params.id, { stitchOutDate }, { new: true });
  await logAction(req.user.userId, 'update_stitching', 'Stitching', stitching._id, 'Stitch out date updated');
  res.json(stitching);
};

const getStitching = async (req, res) => {
  const { search } = req.query;
  const query = search ? { lotNumber: { $regex: search, $options: 'i' } } : {};
  const stitchingRecords = await Stitching.find(query).populate('orderId vendorId');
  res.json(stitchingRecords);
};

module.exports = { createStitching, updateStitching, getStitching };