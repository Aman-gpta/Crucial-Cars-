// backend/scripts/check-users.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/UserModel.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/crucialcars')
    .then(async () => {
        console.log('MongoDB connected...');
        
        try {
            const users = await User.find().select('-password');
            console.log(`Found ${users.length} users:`);
            
            users.forEach((user, index) => {
                console.log(`\n--- User ${index + 1} ---`);
                console.log(`ID: ${user._id}`);
                console.log(`Name: ${user.name}`);
                console.log(`Email: ${user.email}`);
                console.log(`Role: ${user.role}`);
            });
            
        } catch (error) {
            console.error('Error fetching users:', error);
        }
        
        // Close the connection
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
        process.exit(0);
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });
