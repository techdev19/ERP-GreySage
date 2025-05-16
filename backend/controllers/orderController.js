const { Order, Counter } = require('../mongodb_schema');
const { logAction } = require('../utils/logger');

const getNextOrderId = async () => {
  const counter = await Counter.findOneAndUpdate(
    { _id: 'orderId' },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true }
  );
  const sequence = counter.sequence.toString().padStart(3, '0'); // e.g., 001, 002
  const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `ORD-${currentDate}${sequence}`;
};

const createOrder = async (req, res) => {
  const { date, clientId, fabric, fitStyleId, color, washType, shade, whisker, quantity, description } = req.body;
  const orderId = await getNextOrderId();
  const order = new Order({
    orderId,
    date,
    clientId,
    fabric,
    fitStyleId,
    color,
    washType,
    shade,
    whisker,
    quantity,
    description,
    status: 1, // Order Placed
    statusHistory: [{ status: 1, changedAt: new Date() }],
    createdAt: new Date()
  });
  try {
    await order.save();
    await logAction(req.user.userId, 'create_order', 'Order', order._id, `Created order: ${order.orderId}`);
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getOrders = async (req, res) => {
  const { search } = req.query;
  const query = search ? { orderId: { $regex: search, $options: 'i' } } : {};
  const orders = await Order.find(query).populate('clientId fitStyleId');
  res.json(orders);
};

const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const order = await Order.findById(id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  order.status = status;
  order.statusHistory.push({ status, changedAt: new Date() });
  await order.save();
  await logAction(req.user.userId, 'update_order_status', 'Order', order._id, `Updated order status to ${status}`);
  res.json(order);
};

module.exports = { createOrder, getOrders, updateOrderStatus };