// backend/scripts/create-test-request.js
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
        
        try {
            // 1. Find a car
            console.log('Finding an available car...');
            const car = await Car.findOne({ isAvailable: true }).populate('owner');
            
            if (!car) {
                console.log('No available cars found');
                return;
            }
            
            console.log(`Found car: ${car.make} ${car.model} (${car._id})`);
            console.log(`Owner: ${car.owner.name} (${car.owner._id})`);
            
            // 2. Find a journalist
            console.log('Finding a journalist...');
            const journalist = await User.findOne({ role: 'Journalist' });
            
            if (!journalist) {
                console.log('No journalists found');
                return;
            }
            
            console.log(`Found journalist: ${journalist.name} (${journalist._id})`);
            
            // 3. Check if a request already exists
            console.log('Checking for existing requests...');
            const existingRequest = await TestDriveRequest.findOne({
                car: car._id,
                journalist: journalist._id,
                status: { $in: ['Pending', 'Approved'] }
            });
            
            if (existingRequest) {
                console.log(`Request already exists with ID: ${existingRequest._id}`);
                console.log(`Status: ${existingRequest.status}`);
                return;
            }
            
            // 4. Create a new request
            console.log('Creating a new test drive request...');
            const newRequest = new TestDriveRequest({
                journalist: journalist._id,
                car: car._id,
                owner: car.owner._id,
                message: 'This is a test request created for debugging purposes.',
                status: 'Pending'
            });
            
            const savedRequest = await newRequest.save();
            console.log('Test drive request created successfully!');
            console.log(`Request ID: ${savedRequest._id}`);
            console.log(`Status: ${savedRequest.status}`);
            console.log(`Created at: ${savedRequest.createdAt}`);
            
        } catch (error) {
            console.error('Error:', error);
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
