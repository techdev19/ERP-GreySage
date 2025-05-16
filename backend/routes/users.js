const express = require('express');
const router = express.Router();
const { getUsers, deleteUser } = require('../controllers/userController');
const { authenticateToken, restrictTo } = require('../middleware/auth');

router.get('/users', authenticateToken, restrictTo('admin'), getUsers);
router.delete('/users/:id', authenticateToken, restrictTo('admin'), deleteUser);

module.exports = router;