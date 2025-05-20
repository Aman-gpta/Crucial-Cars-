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

// The ID to search for - update this to the car ID you want to check
const CAR_ID_TO_CHECK = "682b0211df91ef021649a8c5"; // Ford Mustang

// The journalist ID to check
const JOURNALIST_ID_TO_CHECK = "682bf522f7543c9295c6a95d"; // journal@gmail.com

try {
  // Check if this car exists
  const car = await Car.findById(CAR_ID_TO_CHECK);
  console.log(`Car exists: ${car ? 'Yes' : 'No'}`);
  if (car) {
    console.log(`Car details: ${car.year} ${car.make} ${car.model}`);
  }
  
  // Get all test drive requests for this car
  const requests = await TestDriveRequest.find({ car: CAR_ID_TO_CHECK })
    .populate('journalist', 'name email role')
    .populate('owner', 'name email role');
  
  console.log(`\nFound ${requests.length} test drive requests for this car:`);
  
  for (const request of requests) {
    console.log('\n--------------------------------------------------');
    console.log(`Request ID: ${request._id}`);
    console.log(`Status: ${request.status}`);
    console.log(`Journalist: ${request.journalist?.name} (${request.journalist?.email})`);
    console.log(`Owner: ${request.owner?.name} (${request.owner?.email})`);
    console.log(`Created At: ${request.createdAt}`);
    console.log(`Updated At: ${request.updatedAt}`);
    console.log('--------------------------------------------------');
  }
  
  // Get all requests by this journalist
  const journalistRequests = await TestDriveRequest.find({ journalist: JOURNALIST_ID_TO_CHECK })
    .populate('car', 'make model year');
  
  console.log(`\nFound ${journalistRequests.length} test drive requests from this journalist:`);
  
  for (const request of journalistRequests) {
    console.log('\n--------------------------------------------------');
    console.log(`Request ID: ${request._id}`);
    console.log(`Status: ${request.status}`);
    console.log(`Car: ${request.car?.make} ${request.car?.model} (${request.car?.year})`);
    console.log(`Created At: ${request.createdAt}`);
    console.log(`Updated At: ${request.updatedAt}`);
    console.log('--------------------------------------------------');
  }
  
  // Check for active requests by this journalist for this car
  const activeRequest = await TestDriveRequest.findOne({
    car: CAR_ID_TO_CHECK,
    journalist: JOURNALIST_ID_TO_CHECK,
    status: { $in: ['Pending', 'Approved'] }
  });
  
  console.log(`\nActive request for this journalist for this car: ${activeRequest ? 'Yes' : 'No'}`);
  if (activeRequest) {
    console.log(`Request ID: ${activeRequest._id}`);
    console.log(`Status: ${activeRequest.status}`);
  }
  
  // Test the actual controller logic directly
  console.log('\nTesting controller logic directly:');
  const request = await TestDriveRequest.findOne({
    car: CAR_ID_TO_CHECK,
    journalist: JOURNALIST_ID_TO_CHECK,
    status: { $in: ['Pending', 'Approved'] }
  });
  
  if (!request) {
    console.log('No active request found for this car by this journalist (404 would be returned)');
  } else {
    console.log(`Found existing request with ID: ${request._id} and status: ${request.status}`);
  }
  
} catch (error) {
  console.error('Error:', error);
} finally {
  // Close the database connection
  await mongoose.connection.close();
  console.log('Disconnected from MongoDB');
  process.exit(0);
}
