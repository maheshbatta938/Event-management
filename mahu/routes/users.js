const router = require('express').Router();
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Get current logged-in user profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update current user profile (e.g. username or password)
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (username) user.username = username;

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      user.password = hashed;
    }

    await user.save();
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Get all users
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
