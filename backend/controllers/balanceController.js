const { Balance } = require('../mongodb_schema');

const getBalance = async (req, res) => {
  const balance = await Balance.findOne({ period: req.params.period, userId: req.user.userId });
  res.json(balance);
};

module.exports = { getBalance };