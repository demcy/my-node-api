const mongoose = require('mongoose');
const User = require('./models/user'); // Adjust the path if necessary

const MONGO_URI = 'mongodb://mongo:27017/mydatabase'; // Adjust the URI if necessary

async function addUser() {
    try {
        await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

        const newUser = new User({
            name: 'Jane Doe',
            email: 'jane.doe@example.com'
        });

        await newUser.save();
        console.log('User added successfully');

        mongoose.connection.close();
    } catch (err) {
        console.error('Error adding user:', err);
    }
}

addUser();
