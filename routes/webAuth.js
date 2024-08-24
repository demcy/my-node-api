const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const User = require('../models/user');


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

router.get('/history', async (req, res) => {
    try {
      const messages = await mongoose.connection.db.collection('messages').find({}).toArray();
      const transformedMessages = await Promise.all(messages.map( async msg => {
        const username = await getUsername(msg.user);
        return {
            message: msg.message,
            user: username,
            timestamp: msg.timestamp
        };
    }));
    transformedMessages.sort((a, b) => a.timestamp - b.timestamp);
      
      res.json(transformedMessages);
    } catch(err) {
      console.error('Message Save Error:', err);
        res.status(500).json({ message: 'Error processing message send request', error: err.message });
    }
  });

  const getUsername = async (userId) => {
    try {
        const user = await mongoose.connection.db.collection('users').findOne({_id: userId});
        console.log("A", user ? user.username : 'Unknown User')
        return user ? user.username : 'Unknown User';
    } catch (err) {
        console.error('Fetching User Error:', err);
        res.status(500).json({ message: 'Error fetching user', error: err.message });
    }
};



module.exports = router;
