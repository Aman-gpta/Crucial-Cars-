import mongoose from 'mongoose';
import dotenv from 'dotenv';
import TestDriveRequest from '../models/TestDriveRequestModel.js';
import User from '../models/UserModel.js';
import Car from '../models/CarModel.js';
import connectDB from '../config/db.js';

dotenv.config();

// Connect to the database
await connectDB();

console.log('Connected to MongoDB');

// Helper function to format output
const formatObject = (obj) => {
  return JSON.stringify(obj, null, 2);
};

try {
  // Get all test drive requests
  const requests = await TestDriveRequest.find({})
    .populate('journalist', 'name email role')
    .populate('owner', 'name email role')
    .populate('car', 'make model year');
  
  console.log(`Found ${requests.length} test drive requests:`);
  
  for (const request of requests) {
    console.log('\n==============================================');
    console.log(`Request ID: ${request._id}`);
    console.log(`Status: ${request.status}`);
    console.log(`Car: ${request.car?.make} ${request.car?.model} (${request.car?.year})`);
    console.log(`Journalist: ${request.journalist?.name} (${request.journalist?.email})`);
    console.log(`Owner: ${request.owner?.name} (${request.owner?.email})`);
    console.log(`Created At: ${request.createdAt}`);
    console.log(`Updated At: ${request.updatedAt}`);
    
    // Check if the data is valid
    console.log('\nData validation:');
    console.log(`- Has journalist ID: ${request.journalist ? 'Yes' : 'No'}`);
    console.log(`- Has owner ID: ${request.owner ? 'Yes' : 'No'}`);
    console.log(`- Has car ID: ${request.car ? 'Yes' : 'No'}`);
    
    // Try to query directly using IDs to verify references
    if (request.journalist?._id) {
      const journalist = await User.findById(request.journalist._id);
      console.log(`- Journalist exists directly by ID: ${journalist ? 'Yes' : 'No'}`);
    }
    
    if (request.car?._id) {
      const car = await Car.findById(request.car._id);
      console.log(`- Car exists directly by ID: ${car ? 'Yes' : 'No'}`);
    }
    
    console.log('==============================================');
  }
  
  // Check for orphaned requests (references to non-existent users or cars)
  console.log('\n\nChecking for potential data integrity issues...');
  
  const allUsers = await User.find({}, '_id');
  const allCars = await Car.find({}, '_id');
  
  const userIds = new Set(allUsers.map(user => user._id.toString()));
  const carIds = new Set(allCars.map(car => car._id.toString()));
  
  let orphanedRequests = [];
  
  for (const request of requests) {
    const issues = [];
    
    if (!userIds.has(request.journalist?._id.toString())) {
      issues.push('Referenced journalist not found in users collection');
    }
    
    if (!userIds.has(request.owner?._id.toString())) {
      issues.push('Referenced owner not found in users collection');
    }
    
    if (!carIds.has(request.car?._id.toString())) {
      issues.push('Referenced car not found in cars collection');
    }
    
    if (issues.length > 0) {
      orphanedRequests.push({
        requestId: request._id,
        issues
      });
    }
  }
  
  if (orphanedRequests.length > 0) {
    console.log('\nFound orphaned requests with data integrity issues:');
    console.log(formatObject(orphanedRequests));
  } else {
    console.log('\nNo data integrity issues found.');
  }
  
} catch (error) {
  console.error('Error:', error);
} finally {
  // Close the database connection
  await mongoose.connection.close();
  console.log('Disconnected from MongoDB');
  process.exit(0);
}
