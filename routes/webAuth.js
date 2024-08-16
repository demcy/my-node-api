const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Updated path
const path = require('path');
require('dotenv').config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Serve the form for login or registration
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Handle form submission for login or registration
router.post('/', async (req, res) => {
    const { username, password } = req.body;

    try {
        let user = await User.findOne({ username });

        if (user) {
            // Existing user: attempt login
            if (await user.comparePassword(password)) {
                const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
                res.json({ message: 'Login successful', token });
            } else {
                res.status(401).json({ message: 'Invalid credentials' });
            }
        } else {
            // New user: register and login
            user = new User({ username, password });
            await user.save();
            const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
            res.json({ message: 'Registration successful', token });
        }
    } catch (err) {
        console.error('Form Submission Error:', err);
        res.status(500).json({ message: 'Error processing form submission', error: err.message });
    }
});

module.exports = router;
