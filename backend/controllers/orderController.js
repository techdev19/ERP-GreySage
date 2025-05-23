const { Order, Counter, Client, FitStyle } = require('../mongodb_schema');
const { logAction } = require('../utils/logger');

const createOrder = async (req, res) => {
  const { date, clientId, fabric, fitStyleId, waistSize, totalQuantity, threadColors, description, attachments } = req.body;

  // Validate threadColors quantities
  const totalThreadQuantity = threadColors.reduce((sum, tc) => sum + parseInt(tc.quantity), 0);
  if (totalThreadQuantity !== totalQuantity) {
    return res.status(400).json({ error: `Sum of thread color quantities (${totalThreadQuantity}) must equal total quantity (${totalQuantity})` });
  }

  // Validate references
  const client = await Client.findById(clientId);
  if (!client) return res.status(404).json({ error: 'Client not found' });

  const fitStyle = await FitStyle.findById(fitStyleId);
  if (!fitStyle) return res.status(404).json({ error: 'Fit Style not found' });

  // Generate orderId using Counter
  const counter = await Counter.findByIdAndUpdate(
    { _id: 'orderId' },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true }
  );
  const sequence = counter.sequence.toString().padStart(3, '0'); // e.g., 001, 002
  const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const orderId = `ORD-${currentDate}${sequence}`;

  const order = new Order({
    orderId,
    date,
    clientId,
    fabric,
    fitStyleId,
    waistSize,
    totalQuantity,
    threadColors,
    description,
    attachments: attachments || [],
    status: 1,
    statusHistory: [{ status: 1, changedAt: new Date() }],
    createdAt: new Date()
  });

  try {
    await order.save();
    //await logAction(req.user.userId, 'create_order', 'Order', order._id, `Order ${orderId} created`);
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  order.status = status;
  order.statusHistory.push({ status, changedAt: new Date() });
  await order.save();
  //await logAction(req.user.userId, 'update_order_status', 'Order', order._id, `Order status updated to ${status}`);
  res.json(order);
};

const getOrders = async (req, res) => {
  const { search } = req.query;
  const query = search ? { orderId: { $regex: search, $options: 'i' } } : {};
  const orders = await Order.find(query).populate('clientId fitStyleId');
  res.json(orders);
};

const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('clientId fitStyleId');
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
};

module.exports = { createOrder, updateOrderStatus, getOrders, getOrderById };