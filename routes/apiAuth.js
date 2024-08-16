const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Updated path
const router = express.Router();
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Register route for API
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const user = new User({ username, password });
        await user.save();

        res.status(201).json({ message: 'Registration successful' });
    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ message: 'Error processing registration request', error: err.message });
    }
});

// Login route for API
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isValid = await user.comparePassword(password);

        if (isValid) {
            const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
            res.json({ message: 'Login successful', token });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ message: 'Error processing login request', error: err.message });
    }
});

module.exports = router;
