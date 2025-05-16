const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Client, Product, Transaction, Invoice, Balance, Report, AuditLog } = require('./mongodb_schema');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://mongodb:27017/sales_accounting', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Role-Based Middleware
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Log Action
const logAction = async (userId, action, entity, entityId, details) => {
  const auditLog = new AuditLog({ userId, action, entity, entityId, details });
  await auditLog.save();
};

// Register User
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword, role: role || 'user' });
    await user.save();
    await logAction(user._id, 'create_user', 'User', user._id, `Registered user: ${username}`);
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login User
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });
    await logAction(user._id, 'login', 'User', user._id, `User logged in: ${user.username}`);
    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Manage Users (Admin Only)
app.get('/api/users', authenticateToken, restrictTo('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', authenticateToken, restrictTo('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await logAction(req.user.userId, 'delete_user', 'User', req.params.id, `Deleted user: ${user.username}`);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Manage Clients
app.post('/api/clients', authenticateToken, async (req, res) => {
  try {
    const client = new Client(req.body);
    await client.save();
    await logAction(req.user.userId, 'create_client', 'Client', client._id, `Created client: ${client.name}`);
    res.status(201).json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/clients', authenticateToken, async (req, res) => {
  try {
    const { search } = req.query;
    const query = search ? { name: { $regex: search, $options: 'i' } } : {};
    const clients = await Client.find(query);
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Manage Products
app.post('/api/products', authenticateToken, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    await logAction(req.user.userId, 'create_product', 'Product', product._id, `Created product: ${product.productName}`);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products', authenticateToken, async (req, res) => {
  try {
    const { search } = req.query;
    const query = search ? { design: { $regex: search, $options: 'i' } } : {};
    const products = await Product.find(query);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Invoice with Transactions
app.post('/api/invoices', authenticateToken, async (req, res) => {
  try {
    const { clientId, transactions, invoiceNumber } = req.body;
    let totalAmount = 0;
    const transactionIds = [];

    for (const t of transactions) {
      const product = await Product.findById(t.productId);
      if (!product) throw new Error('Product not found');
      const amount = t.pieces * product.rate;
      const transaction = new Transaction({
        date: t.date,
        productId: t.productId,
        pieces: t.pieces,
        rate: product.rate,
        amount,
        payment: t.payment || 0,
        userId: req.user.userId,
        clientId
      });
      await transaction.save();
      transactionIds.push(transaction._id);
      totalAmount += amount;
    }

    const invoice = new Invoice({
      invoiceNumber,
      clientId,
      transactions: transactionIds,
      totalAmount,
      userId: req.user.userId,
      status: totalAmount === transactions.reduce((sum, t) => sum + (t.payment || 0), 0) ? 'paid' : 'pending'
    });
    await invoice.save();

    // Update balance
    const period = 'January 2025';
    let balance = await Balance.findOne({ period, userId: req.user.userId });
    if (!balance) {
      balance = new Balance({ period, startingBalance: 797850, userId: req.user.userId });
    }
    balance.totalSales += totalAmount;
    balance.totalPayments += transactions.reduce((sum, t) => sum + (t.payment || 0), 0);
    balance.closingBalance = balance.startingBalance + balance.totalSales - balance.totalPayments;
    await balance.save();

    await logAction(req.user.userId, 'create_invoice', 'Invoice', invoice._id, `Created invoice: ${invoiceNumber}`);
    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/invoices', authenticateToken, async (req, res) => {
  try {
    const { search, status } = req.query;
    const query = { userId: req.user.userId };
    if (search) query.invoiceNumber = { $regex: search, $options: 'i' };
    if (status) query.status = status;
    const invoices = await Invoice.find(query).populate('clientId transactions');
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Transaction (Admin Only)
app.delete('/api/transactions/:id', authenticateToken, restrictTo('admin'), async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

    await Invoice.updateOne({ transactions: transaction._id }, { $pull: { transactions: transaction._id } });

    const period = 'January 2025';
    const balance = await Balance.findOne({ period, userId: req.user.userId });
    if (balance) {
      balance.totalSales -= transaction.amount;
      balance.totalPayments -= transaction.payment;
      balance.closingBalance = balance.startingBalance + balance.totalSales - balance.totalPayments;
      await balance.save();
    }

    await logAction(req.user.userId, 'delete_transaction', 'Transaction', req.params.id, `Deleted transaction`);
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate Report
app.post('/api/reports', authenticateToken, async (req, res) => {
  try {
    const { period } = req.body;
    const transactions = await Transaction.find({ userId: req.user.userId, date: { $gte: 45660, $lte: 45738 } })
      .populate('productId');
    const balance = await Balance.findOne({ period, userId: req.user.userId });

    const designStats = {};
    transactions.forEach(t => {
      const design = t.productId.design;
      if (!designStats[design]) {
        designStats[design] = { pieces: 0, amount: 0 };
      }
      designStats[design].pieces += t.pieces;
      designStats[design].amount += t.amount;
    });

    const topDesigns = Object.entries(designStats)
      .map(([design, stats]) => ({ design, ...stats }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const report = new Report({
      period,
      totalSales: balance?.totalSales || 0,
      totalPayments: balance?.totalPayments || 0,
      outstandingBalance: balance?.closingBalance || 0,
      topDesigns,
      userId: req.user.userId
    });
    await report.save();

    await logAction(req.user.userId, 'generate_report', 'Report', report._id, `Generated report for ${period}`);
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/reports', authenticateToken, async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user.userId });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Balance
app.get('/api/balance/:period', authenticateToken, async (req, res) => {
  try {
    const balance = await Balance.findOne({ period: req.params.period, userId: req.user.userId });
    res.json(balance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Audit Logs (Admin Only)
app.get('/api/audit-logs', authenticateToken, restrictTo('admin'), async (req, res) => {
  try {
    const logs = await AuditLog.find().populate('userId');
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));