const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
//const authenticatedUsers = require('./utils/authenticatedUsers'); 
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const path = require('path');
const apiAuthRoutes = require('./routes/apiAuth');
const usersRoutes = require('./routes/users');
const webAuthRoutes = require('./routes/webAuth');
const chatRoutes = require('./routes/chat');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/my-simple-auth-app';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1 * 24 * 60 * 60 * 1000 }, //time period in miliseconds
    store: MongoStore.create({ 
        client: mongoose.connection.getClient(), // Use mongoose's underlying MongoDB client
        dbName: 'mydatabase',
        ttl: 1 * 24 * 60 * 60, // = 1 days. Default
        touchAfter: 1 * 60 * 60, // time period in seconds
        autoRemove: 'interval',
        autoRemoveInterval: 1, // In minutes. Default
        // crypto: {
        //     secret: 'session-crypto-key'
        //   }
     })
});
app.use(sessionMiddleware);

app.use('/api/auth', apiAuthRoutes);
app.use('/', webAuthRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/messages', chatRoutes);

// Handle 404
app.use((req, res, next) => {
    res.status(404).json({ message: 'Not Found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});

// Socket.IO setups
io.on('connection', async (socket) => {
    const sessionId = socket.request.session.id
    try {
        const closedSession = await mongoose.connection.db.collection('sessions').findOne({_id: sessionId});
        const sessionData = JSON.parse(closedSession.session)
        sessionData.isOnline = true;
        const updatedData = JSON.stringify(sessionData);
        await mongoose.connection.db.collection('sessions').updateOne(
            { _id: sessionId },  // Match the document by _id
            { $set: { session: updatedData } }  // Set the updated session string
        );
    } catch (err) {
        console.error('Error retrieving sessions:', err);
    }
    // socket.request.session.isOnline = true;
    // socket.request.session.save();
    // console.log(socket.request.session.id)

    console.log('A user connected');
    const clientsCount = io.engine.clientsCount; // Total clients across all namespaces
    console.log(`Total connected clients: ${clientsCount}`);
    // Emit the current client count to all clients
    io.emit('current-people-update', clientsCount);
    io.emit('authenticated-users-update');
    socket.on('authenticate', () => {
        io.emit('authenticated-users-update');
    });
    socket.on('message', () => {
        io.emit('update-chat');
    })
    socket.on('disconnect', async () => {
        try {
            const closedSession = await mongoose.connection.db.collection('sessions').findOne({_id: sessionId});
            const sessionData = JSON.parse(closedSession.session)
            sessionData.isOnline = false;
            const updatedData = JSON.stringify(sessionData);
            await mongoose.connection.db.collection('sessions').updateOne(
                { _id: sessionId },  // Match the document by _id
                { $set: { session: updatedData } }  // Set the updated session string
            );
        } catch (err) {
            console.error('Error retrieving sessions:', err);
        }
        
        // let socketSession = socket.request.session;
        // socketSession.isOnline =  false ;
        // socketSession.save();
        // console.log(socketSession.id, socketSession)

        console.log('A user disconnected');
        const updatedClientsCount = io.engine.clientsCount;
        console.log(`Total connected clients: ${updatedClientsCount}`);
        io.emit('current-people-update', updatedClientsCount);
        io.emit('authenticated-users-update');
    });
});


server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
