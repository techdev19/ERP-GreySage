const { Finishing, Order, Lot } = require('../mongodb_schema');
const { updateVendorBalance } = require('../services/vendorBalanceService');
// const { logAction } = require('../utils/logger');

const createFinishing = async (req, res) => {
  const { invoiceNumber, orderId, vendorId, quantity, quantityShort, rate, date, finishOutDate, description } = req.body;

  try {
    // Validate required fields
    if (!invoiceNumber) return res.status(400).json({ error: 'Invoice number is required' });
    if (!orderId) return res.status(400).json({ error: 'Order ID is required' });
    if (!vendorId) return res.status(400).json({ error: 'Vendor ID is required' });
    if (!quantity || quantity <= 0) return res.status(400).json({ error: 'Quantity must be a positive number' });
    if (!rate || rate < 0) return res.status(400).json({ error: 'Rate must be a non-negative number' });

    // Validate invoiceNumber as a number
    const parsedInvoiceNumber = parseInt(invoiceNumber, 10);
    if (isNaN(parsedInvoiceNumber)) {
      return res.status(400).json({ error: 'Invoice number must be a valid number' });
    }

    // Validate invoiceNumber and orderId
    const lot = await Lot.findOne({ invoiceNumber: parsedInvoiceNumber, orderId });
    if (!lot) {
      return res.status(400).json({ error: 'Invalid invoiceNumber or orderId' });
    }

    const finishing = new Finishing({
      lotId: lot._id,
      orderId,
      vendorId,
      quantity,
      quantityShort: quantityShort || 0,
      rate,
      date: date,
      finishOutDate,
      description,
      createdAt: new Date(),
    });

    await finishing.save();

    // Update the Order status to 4 (Order in Finishing)
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status < 4) {
      order.status = 4;
      order.statusHistory.push({ status: 4, changedAt: new Date() });
      await order.save();
    }

    await updateVendorBalance(vendorId, 'finishing', lot._id, orderId, quantity, rate);
    // await logAction(req.user.userId, 'create_finishing', 'Finishing', finishing._id, `Lot with invoice ${parsedInvoiceNumber} finished`);

    res.status(201).json(finishing);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateFinishing = async (req, res) => {
  const { finishOutDate } = req.body;
  try {
    const finishing = await Finishing.findByIdAndUpdate(req.params.id, { finishOutDate }, { new: true });
    if (!finishing) return res.status(404).json({ error: 'Finishing record not found' });

    // Update the Order status to 5 (Order Complete) if finishOutDate is set
    const order = await Order.findById(finishing.orderId);
    if (order && finishOutDate && order.status < 5) {
      order.status = 5;
      order.statusHistory.push({ status: 5, changedAt: new Date() });
      await order.save();
    }

    // await logAction(req.user.userId, 'update_finishing', 'Finishing', finishing._id, 'Finish out date updated, ready for shipment');
    res.json(finishing);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getFinishing = async (req, res) => {
  const { search, invoiceNumber } = req.query;
  try {
    let query = {};
    if (search) {
      query.lotId = { $in: await Lot.find({ lotNumber: { $regex: search, $options: 'i' } }).distinct('_id') };
    } else if (invoiceNumber) {
      const parsedInvoiceNumber = parseInt(invoiceNumber, 10);
      if (isNaN(parsedInvoiceNumber)) {
        return res.status(400).json({ error: 'Invoice number must be a valid number' });
      }
      query.lotId = { $in: await Lot.find({ invoiceNumber: parsedInvoiceNumber }).distinct('_id') };
    }
    const finishingRecords = await Finishing.find(query).populate('orderId vendorId lotId');
    res.json(finishingRecords);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { createFinishing, updateFinishing, getFinishing };