const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String },
  email: { type: String },
  address: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const ProductSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  design: { type: String },
  rate: { type: Number, required: true },
  associateBrand: { type: String },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const TransactionSchema = new mongoose.Schema({
  date: { type: Number, required: true },
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  pieces: { type: Number, default: 0 },
  trnxRate: { type: Number, default: 0 },
  amount: { type: Number, required: true },
  payment: { type: Number, default: 0 },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  createdAt: { type: Date, default: Date.now }
});

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid', 'partial'], default: 'pending' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const BalanceSchema = new mongoose.Schema({
  period: { type: String, required: true },
  startingBalance: { type: Number, required: true },
  totalSales: { type: Number, default: 0 },
  totalPayments: { type: Number, default: 0 },
  closingBalance: { type: Number, default: 0 },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const ReportSchema = new mongoose.Schema({
  period: { type: String, required: true },
  totalSales: { type: Number, default: 0 },
  totalPayments: { type: Number, default: 0 },
  outstandingBalance: { type: Number, default: 0 },
  topDesigns: [{ design: String, pieces: Number, amount: Number }],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const AuditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  entity: { type: String, required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  details: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Client = mongoose.model('Client', ClientSchema);
const Product = mongoose.model('Product', ProductSchema);
const Transaction = mongoose.model('Transaction', TransactionSchema);
const Invoice = mongoose.model('Invoice', InvoiceSchema);
const Balance = mongoose.model('Balance', BalanceSchema);
const Report = mongoose.model('Report', ReportSchema);
const AuditLog = mongoose.model('AuditLog', AuditLogSchema);

module.exports = { User, Client, Product, Transaction, Invoice, Balance, Report, AuditLog };