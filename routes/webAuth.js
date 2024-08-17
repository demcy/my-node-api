const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const path = require('path');
const authenticatedUsers = require('../utils/authenticatedUsers'); // Shared module for authenticated users
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// Serve the form for login or registration
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Route to get count of authenticated users
router.get('/authenticated-users-count', (req, res) => {
    console.log(authenticatedUsers.size)
    res.json({ 
        count: authenticatedUsers.size,
        users: Array.from(authenticatedUsers) 
    });
});

router.post('/is-valid', (req, res) => {
    const { token } = req.body;
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Authentication error:', err);
            res.json({ 
                valid: false,
            });
            return;
        }
        res.json({ 
            valid: true,
        });
    });
});



module.exports = router;
