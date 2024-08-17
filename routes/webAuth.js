const express = require('express');
const path = require('path');
const authenticatedUsers = require('../utils/authenticatedUsers'); // Shared module for authenticated users

const router = express.Router();

// Serve the form for login or registration
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Route to get count of authenticated users
router.get('/authenticated-users-count', (req, res) => {
    res.json({ count: authenticatedUsers.size });
});

module.exports = router;
