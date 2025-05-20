// backend/scripts/delete-test-request.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import TestDriveRequest from '../models/TestDriveRequestModel.js';

dotenv.config();

// Request ID to delete (replace with the ID from the create-test-request.js output)
const requestId = '682c52fd2f5b6fd00d6659db';

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/crucialcars')
    .then(async () => {
        console.log('MongoDB connected...');
        
        try {
            // Find and delete the request
            console.log(`Attempting to delete request with ID: ${requestId}`);
            const result = await TestDriveRequest.findByIdAndDelete(requestId);
            
            if (result) {
                console.log('Test drive request deleted successfully!');
                console.log(`Request details:`, result);
            } else {
                console.log(`No request found with ID: ${requestId}`);
            }
            
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
