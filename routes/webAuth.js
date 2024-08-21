const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;


// Serve the form for login or registration
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/chat.html'));
});

// Route to get count of authenticated users
router.get('/authenticated-users', async (req, res) => {
    try {
        const sessions = await mongoose.connection.db.collection('sessions').find({}).toArray();
        const usernames = sessions
            .filter(session => JSON.parse(session.session).isOnline)
            .filter(session => JSON.parse(session.session).username)
            .map(session => JSON.parse(session.session).username);
        res.json({
            count: usernames.length,
            usernames: usernames
        });
    } catch (err) {
        console.error('Error retrieving sessions:', err);
        res.status(500).send('Error retrieving sessions');
    }
});

router.get('/is-authenticated', (req, res) => {
    const token = req.session.token;
    if (token) {
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
    }
});



module.exports = router;
