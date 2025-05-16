const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../mongodb_schema');
const { logAction } = require('../utils/logger');

const register = async (req, res) => {
  const { username, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, email, password: hashedPassword, role: role || 'user' });
  await user.save();
  await logAction(user._id, 'create_user', 'User', user._id, `Registered user: ${username}`);
  res.status(201).json({ message: 'User registered' });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });
  await logAction(user._id, 'login', 'User', user._id, `User logged in: ${user.username}`);
  res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
};

module.exports = { register, login };