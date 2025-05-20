import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/UserModel.js';
import Car from '../models/CarModel.js';
import connectDB from '../config/db.js';

dotenv.config();

// Connect to the database
await connectDB();

console.log('Connected to MongoDB');

try {
  // Get all cars
  const cars = await Car.find({}).populate('owner', 'name email');
  
  console.log('==== ALL CARS ====');
  for (const car of cars) {
    console.log(`ID: ${car._id}`);
    console.log(`${car.year} ${car.make} ${car.model}`);
    console.log(`Owner: ${car.owner?.name} (${car.owner?.email})`);
    console.log(`Location: ${car.location}`);
    console.log(`Available: ${car.isAvailable ? 'Yes' : 'No'}`);
    console.log('------------------------------');
  }
  
  // Get all journalists
  const journalists = await User.find({ role: 'Journalist' });
  
  console.log('\n==== ALL JOURNALISTS ====');
  for (const journalist of journalists) {
    console.log(`ID: ${journalist._id}`);
    console.log(`Name: ${journalist.name}`);
    console.log(`Email: ${journalist.email}`);
    console.log('------------------------------');
  }
  
} catch (error) {
  console.error('Error:', error);
} finally {
  // Close the database connection
  await mongoose.connection.close();
  console.log('Disconnected from MongoDB');
  process.exit(0);
}
