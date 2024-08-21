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

// Create a MongoDB client using the native driver
// const clientPromise = MongoClient.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(client => {
//         console.log('Connected to MongoDB with native MongoClient');
//         return client;
//     })
//     .catch(err => {
//         console.error('MongoClient connection error:', err);
//     });
    //const clientPromise = mongoose.connection.asPromise();

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
io.on('connection', (socket) => {
    
    console.log('A user connected');
    const clientsCount = io.engine.clientsCount; // Total clients across all namespaces
    console.log(`Total connected clients: ${clientsCount}`);
    socket.request.session.isOnline = true;
    socket.request.session.save();
    console.log(socket.request.session.id)
    // Emit the current client count to all clients
    io.emit('current-people-update', clientsCount);
    io.emit('authenticated-users-update');
    // const socketSession = socket.request.session;
    // console.log(socketSession)
    // console.log(socketSession.id)

    // 
    // if (socketSession.username) {
    //     socket.username = socketSession.username;
    //     console.log(socket.username)
    // }

    socket.on('authenticate', () => {
        io.emit('authenticated-users-update');
    });

    socket.on('disconnect', () => {
        let socketSession = socket.request.session;
        socketSession.isOnline =  false ;
        socketSession.save();
        console.log(socketSession.id, socketSession)
        

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
