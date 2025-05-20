// backend/scripts/check-requests.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import TestDriveRequest from '../models/TestDriveRequestModel.js';
import Car from '../models/CarModel.js';
import User from '../models/UserModel.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/crucialcars')
    .then(async () => {
        console.log('MongoDB connected...');
        
        // Get all test drive requests
        try {
            const requests = await TestDriveRequest.find().populate('car journalist owner');
            console.log(`Found ${requests.length} test drive requests`);
            
            if (requests.length > 0) {
                requests.forEach((req, index) => {
                    console.log(`\n--- Request ${index + 1} ---`);
                    console.log(`ID: ${req._id}`);
                    console.log(`Car: ${req.car?.make} ${req.car?.model}`);
                    console.log(`Journalist: ${req.journalist?.name} (${req.journalist?.email})`);
                    console.log(`Owner: ${req.owner?.name} (${req.owner?.email})`);
                    console.log(`Status: ${req.status}`);
                    console.log(`Created: ${req.createdAt}`);
                });
            } else {
                console.log('No test drive requests found in the database');
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
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
