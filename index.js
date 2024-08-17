const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const apiAuthRoutes = require('./routes/apiAuth');
const webAuthRoutes = require('./routes/webAuth');
const authenticatedUsers = new Set();
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/my-simple-auth-app';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false
}));

app.use('/api/auth', apiAuthRoutes);
app.use('/', webAuthRoutes);

// Handle 404
app.use((req, res, next) => {
    res.status(404).json({ message: 'Not Found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Socket.IO setup
// Add this to your existing socket event handlers
io.on('connection', (socket) => {
    console.log('A user connected');

    const clientsCount = io.engine.clientsCount; // Total clients across all namespaces

    console.log(`Total connected clients: ${clientsCount}`);

    socket.on('authenticate', (token, callback) => {
        console.log('Authenticate event received with token:', token);

        if (!token) {
            console.error('No token provided');
            callback({ error: 'No token provided' });
            socket.disconnect();
            return;
        }

        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                console.error('Authentication error:', err);
                callback({ error: 'Authentication error' });
                socket.disconnect();
                return;
            }
            socket.user = user;
            authenticatedUsers.add(user.username);
            console.log(`User authenticated: ${user.username}`);
            io.emit('authenticated-users-update', authenticatedUsers.size); // Emit updated user count
            callback({ success: true });
        });
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
        const updatedClientsCount = io.engine.clientsCount;
        console.log(`Total connected clients: ${updatedClientsCount}`);
        if (socket.user) {
            authenticatedUsers.delete(socket.user.username);
            console.log(`User disconnected: ${socket.user.username}`);
            io.emit('authenticated-users-update', authenticatedUsers.size); // Emit updated user count
        } else {
            console.log('User disconnected without authentication');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
