const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const apiAuthRoutes = require('./routes/apiAuth');
const webAuthRoutes = require('./routes/webAuth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/my-simple-auth-app';

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve static files (e.g., the HTML form)
app.use(express.static(path.join(__dirname, 'public')));

// Session setup (optional)
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false
}));

// Use routes
app.use('/api/auth', apiAuthRoutes);
app.use('/', webAuthRoutes);

// Handle 404 - Page Not Found
app.use((req, res, next) => {
    res.status(404).json({ message: 'Not Found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
