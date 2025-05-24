const { Invoice, Balance } = require('../mongodb_schema');
const { logAction } = require('../utils/logger');

const createInvoice = async (req, res) => {
  const { clientId, orderId, invoiceNumber, totalAmount } = req.body;
  const invoice = new Invoice({
    invoiceNumber,
    clientId,
    orderId,
    totalAmount,
    userId: req.user.userId,
    status: 'pending'
  });
  await invoice.save();

  // Update balance
  const period = new Date().toISOString().slice(0, 7); // e.g., "2025-05"
  let balance = await Balance.findOne({ period, userId: req.user.userId });
  if (!balance) {
    balance = new Balance({ period, startingBalance: 0, userId: req.user.userId });
  }
  balance.totalSales += totalAmount;
  balance.closingBalance = balance.startingBalance + balance.totalSales - balance.totalPayments;
  await balance.save();

  //await logAction(req.user.userId, 'create_invoice', 'Invoice', invoice._id, `Created invoice: ${invoiceNumber}`);
  res.status(201).json(invoice);
};

const getInvoices = async (req, res) => {
  const { search, status } = req.query;
  const query = { userId: req.user.userId };
  if (search) query.invoiceNumber = { $regex: search, $options: 'i' };
  if (status) query.status = status;
  const invoices = await Invoice.find(query).populate('clientId orderId');
  res.json(invoices);
};

module.exports = { createInvoice, getInvoices };