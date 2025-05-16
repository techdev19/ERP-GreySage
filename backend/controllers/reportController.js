const { Order, Balance, Report, FitStyle } = require('../mongodb_schema');
const { logAction } = require('../utils/logger');

const generateReport = async (req, res) => {
  const { period } = req.body;
  const orders = await Order.find({ userId: req.user.userId }).populate('fitStyleId');
  const balance = await Balance.findOne({ period, userId: req.user.userId });

  const fitStyleStats = {};
  orders.forEach(order => {
    const fitStyleId = order.fitStyleId._id.toString();
    if (!fitStyleStats[fitStyleId]) {
      fitStyleStats[fitStyleId] = { fitStyleId: order.fitStyleId._id, quantity: 0, amount: 0 };
    }
    fitStyleStats[fitStyleId].quantity += order.quantity;
    fitStyleStats[fitStyleId].amount += order.quantity; // Simplified; adjust if rate exists
  });

  const topFitStyles = Object.values(fitStyleStats)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const report = new Report({
    period,
    totalSales: balance?.totalSales || 0,
    totalPayments: balance?.totalPayments || 0,
    outstandingBalance: balance?.closingBalance || 0,
    topFitStyles,
    userId: req.user.userId
  });
  await report.save();

  await logAction(req.user.userId, 'generate_report', 'Report', report._id, `Generated report for ${period}`);
  res.status(201).json(report);
};

const getReports = async (req, res) => {
  const reports = await Report.find({ userId: req.user.userId }).populate('topFitStyles.fitStyleId');
  res.json(reports);
};

module.exports = { generateReport, getReports };