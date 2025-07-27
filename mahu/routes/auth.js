const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// Register
router.post('/register',
  body('username').isLength({ min: 3 }),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { username, password, role } = req.body;
      const existingUser = await User.findOne({ username });
      if(existingUser) return res.status(400).json({ message: 'Username already exists' });

      const hashed = await bcrypt.hash(password, 10);
      const user = new User({ username, password: hashed, role: role || 'user' });
      await user.save();

      res.json({ message: 'User registered' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Login
router.post('/login',
  body('username').exists(),
  body('password').exists(),
  async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if(!user) return res.status(400).json({ message: 'Invalid credentials' });

      const validPass = await bcrypt.compare(password, user.password);
      if(!validPass) return res.status(400).json({ message: 'Invalid credentials' });

      const token = jwt.sign({ _id: user._id, role: user.role, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1d' });
      res.json({ token, user: { username: user.username, role: user.role } });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;
