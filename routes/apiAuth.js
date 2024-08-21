const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

// Register route
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const user = new User({ username, password });
        await user.save();
        
        req.session.isOnline = true;
        req.session.username = username;

        res.status(201).json({ message: 'Registration successful' });
    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ message: 'Error processing registration request', error: err.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(400).json({ message: 'No user found' });
        }

        const isValid = await user.comparePassword(password);

        if (isValid) {
            const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
            req.session.isOnline = true;
            req.session.username = username;
            req.session.token = token;
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
