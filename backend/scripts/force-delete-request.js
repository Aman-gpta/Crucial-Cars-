import mongoose from 'mongoose';
import dotenv from 'dotenv';
import TestDriveRequest from '../models/TestDriveRequestModel.js';
import connectDB from '../config/db.js';

dotenv.config();

// Connect to the database
await connectDB();

console.log('Connected to MongoDB');

// The ID of the request to delete
const REQUEST_ID = "682bf530f7543c9295c6a96c"; // Update with the request ID to delete

try {
  // First check if request exists
  const request = await TestDriveRequest.findById(REQUEST_ID);
  
  if (!request) {
    console.log(`Request with ID ${REQUEST_ID} not found.`);
    process.exit(0);
  }
  
  console.log('Found request:');
  console.log(`Request ID: ${request._id}`);
  console.log(`Journalist ID: ${request.journalist}`);
  console.log(`Car ID: ${request.car}`);
  console.log(`Status: ${request.status}`);
  
  // Delete the request
  console.log('\nDeleting request...');
  const result = await TestDriveRequest.findByIdAndDelete(REQUEST_ID);
  
  if (result) {
    console.log('Request successfully deleted.');
  } else {
    console.log('Failed to delete the request.');
  }
  
  // Verify the request was deleted
  const verifyDeleted = await TestDriveRequest.findById(REQUEST_ID);
  console.log(`Verification - Is request still present?: ${verifyDeleted ? 'Yes' : 'No'}`);
  
} catch (error) {
  console.error('Error:', error);
} finally {
  // Close the database connection
  await mongoose.connection.close();
  console.log('Disconnected from MongoDB');
  process.exit(0);
}
