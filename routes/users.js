const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/user');

const router = express.Router();

// Access protected route - Get current user's profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findByUserName(req.user.username).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Example of another protected route - Update user info
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findByUserName(req.user.username);

    if (user) {
      user.username = username || user.username;
      user.password = password || user.password;

      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
