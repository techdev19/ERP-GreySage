const mongoose = require('mongoose');
const { Stitching, Order, Lot } = require('../mongodb_schema');
const { updateVendorBalance } = require('../services/vendorBalanceService');
const { logAction } = require('../utils/logger');

const createStitching = async (req, res) => {
  const { lotNumber, orderId, invoiceNumber, vendorId, quantity, quantityShort, rate, date, stitchOutDate, description } = req.body;
  let session = null;

  // Validate required fields
  if (!lotNumber) return res.status(400).json({ error: 'Lot number is required' });
  if (!invoiceNumber) return res.status(400).json({ error: 'Invoice number is required' });
  if (!orderId) return res.status(400).json({ error: 'Order ID is required' });
  if (!vendorId) return res.status(400).json({ error: 'Vendor ID is required' });
  if (!quantity || quantity <= 0) return res.status(400).json({ error: 'Quantity must be a positive number' });
  if (!rate || rate < 0) return res.status(400).json({ error: 'Rate must be a non-negative number' });
  if (typeof invoiceNumber !== 'number' || isNaN(invoiceNumber)) {
    return res.status(400).json({ error: 'Invoice number must be a valid number' });
  }

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

    // Validate lotNumber and invoiceNumber uniqueness
    const existingLot = await Lot.findOne({
      $or: [{ lotNumber }, { invoiceNumber }],
    });
    if (existingLot) {
      if (existingLot.lotNumber === lotNumber) {
        return res.status(400).json({ error: 'Lot number already exists' });
      }
      if (existingLot.invoiceNumber === invoiceNumber) {
        return res.status(400).json({ error: 'Invoice number already exists' });
      }
    }

    // Start a MongoDB session and transaction
    session = await mongoose.startSession();
    session.startTransaction();

    // Create Lot document within the transaction
    const lot = new Lot({
      lotNumber,
      invoiceNumber,
      orderId,
      date: date,
      description,
      createdAt: new Date(),
    });
    await lot.save({ session });

    // Create Stitching entry within the transaction
    const stitching = new Stitching({
      lotId: lot._id,
      orderId,
      vendorId,
      quantity,
      quantityShort: quantityShort || 0,
      rate,
      date: date,
      stitchOutDate,
      description,
      createdAt: new Date(),
    });
    await stitching.save({ session });

    // Update the Order status to 2 (Order in Stitching) within the transaction
    if (order.status < 2) {
      order.status = 2;
      order.statusHistory.push({ status: 2, changedAt: new Date() });
      await order.save({ session });
    }

    // Commit the transaction
    await session.commitTransaction();

    // Perform non-transactional updates
    await updateVendorBalance(vendorId, 'stitching', lot._id, orderId, quantity, rate);
    // await logAction(req.user.userId, 'create_stitching', 'Stitching', stitching._id, `Lot ${lotNumber} with invoice ${invoiceNumber} created`);

    res.status(201).json(stitching);
  } catch (error) {
    // Abort the transaction on error
    if (session) {
      await session.abortTransaction();
    }

    if (error.code === 11000) {
      return res.status(400).json({ error: 'Duplicate lotNumber or invoiceNumber' });
    }
    res.status(400).json({ error: error.message });
  } finally {
    // Always end the session
    if (session) {
      session.endSession();
    }
  }
};

const updateStitching = async (req, res) => {
  const { stitchOutDate } = req.body;
  try {
    const stitching = await Stitching.findByIdAndUpdate(req.params.id, { stitchOutDate }, { new: true });
    if (!stitching) return res.status(404).json({ error: 'Stitching record not found' });
    // await logAction(req.user.userId, 'update_stitching', 'Stitching', stitching._id, 'Stitch out date updated');
    res.json(stitching);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getStitching = async (req, res) => {
  const { search, orderId, invoiceNumber } = req.query;
  try {
    let query = {};
    if (search) {
      query.lotId = { $in: await Lot.find({ lotNumber: { $regex: search, $options: 'i' } }).distinct('_id') };
    } else if (orderId) {
      query.orderId = orderId;
    } else if (invoiceNumber) {
      query.lotId = { $in: await Lot.find({ invoiceNumber: parseInt(invoiceNumber, 10) }).distinct('_id') };
    }
    const stitchingRecords = await Stitching.find(query).populate('lotId orderId vendorId');
    res.json(stitchingRecords);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { createStitching, updateStitching, getStitching };