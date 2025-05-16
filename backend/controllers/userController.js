const { User } = require('../mongodb_schema');
const { logAction } = require('../utils/logger');

const getUsers = async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
};

const deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  await logAction(req.user.userId, 'delete_user', 'User', req.params.id, `Deleted user: ${user.username}`);
  res.json({ message: 'User deleted' });
};

module.exports = { getUsers, deleteUser };