const { Stitching, Order, Lot } = require('../mongodb_schema');
const { createLot } = require('../services/lotNumberService');
const { updateVendorBalance } = require('../services/vendorBalanceService');
const { logAction } = require('../utils/logger');

const createStitching = async (req, res) => {
  const { lotNumber, orderId, invoiceNumber, vendorId, quantity, quantityShort, rate, date, stitchOutDate, description } = req.body;

  // Validate required fields
  if (!lotNumber) return res.status(400).json({ error: 'Lot number is required' });
  if (!invoiceNumber) return res.status(400).json({ error: 'Invoice number is required' });

  try {
    // Check totalQuantity against existing stitching entries
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const existingStitchings = await Stitching.find({ orderId });
    const totalStitchedQuantity = existingStitchings.reduce((sum, stitching) => sum + stitching.quantity, 0);
    const newTotal = totalStitchedQuantity + quantity;

    if (newTotal > order.totalQuantity) {
      return res.status(400).json({ error: `Total stitched quantity (${newTotal}) exceeds order's totalQuantity (${order.totalQuantity})` });
    }

    const lotResp = await createLot(req.body);
    if (lotResp.code !== 0 && !lotResp.lotObj?._id) return res.status(500).json(lotResp);

    const stitching = new Stitching({
      lotId: lotResp.lotObj._id,
      orderId,
      date,
      stitchOutDate,
      vendorId,
      quantity,
      quantityShort,
      rate,
      description,
      createdAt: new Date()
    });
    await stitching.save();

    // Update the Order status to 2 (Order in Stitching)
    if (order.status < 2) {
      order.status = 2;
      order.statusHistory.push({ status: 2, changedAt: new Date() });
      await order.save();
    }
    await updateVendorBalance(vendorId, 'stitching', lotNumber, orderId, quantity, rate);
    //await logAction(req.user.userId, 'create_stitching', 'Stitching', stitching._id, `Lot ${lotNumber} created`);
    res.status(201).json(stitching);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateStitching = async (req, res) => {
  const { stitchOutDate } = req.body;
  const stitching = await Stitching.findByIdAndUpdate(req.params.id, { stitchOutDate }, { new: true });
  if (!stitching) return res.status(404).json({ error: 'Stitching record not found' });
  //await logAction(req.user.userId, 'update_stitching', 'Stitching', stitching._id, 'Stitch out date updated');
  res.json(stitching);
};

const getStitching = async (req, res) => {
  // const { search, orderId } = req.query;
  // const query = {};
  // if (search) query.lotNumber = { $regex: search, $options: 'i' };
  // if (orderId) query.orderId = orderId;
  // const stitchingRecords = await Stitching.find(query).populate('orderId vendorId');
  // res.json(stitchingRecords);

  const { search, orderId, invoiceNumber } = req.query;
  let query = {};
  if (search) {
    query.lotId = { $in: await Lot.find({ lotNumber: { $regex: search, $options: 'i' } }).distinct('_id') };
  } else if (orderId) {
    query.orderId = orderId;
  } else if (invoiceNumber) {
    query.lotId = { $in: await Lot.find({ invoiceNumber: { $regex: invoiceNumber, $options: 'i' } }).distinct('_id') };
  }
  const stitchingRecords = await Stitching.find(query).populate('lotId orderId vendorId');
  res.json(stitchingRecords);
};

module.exports = { createStitching, updateStitching, getStitching };