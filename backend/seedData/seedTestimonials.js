// backend/seedData/seedTestimonials.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import colors from 'colors';
import connectDB from '../config/db.js';
import Testimonial from '../models/TestimonialModel.js';

// Configure environment variables
dotenv.config();

// Connect to the database
connectDB();

// Sample testimonials data
const testimonials = [
    {
        name: "Ananya Verma",
        role: "Automobile Journalist",
        image: "https://randomuser.me/api/portraits/women/45.jpg",
        text: "CrucialCars helped me find the perfect car for my latest article. The process was seamless, and the car owner was very accommodating!"
    },
    {
        name: "Rohan Mehta",
        role: "Car Enthusiast",
        image: "https://randomuser.me/api/portraits/men/50.jpg",
        text: "As a car owner, I love sharing my vehicle with influencers. CrucialCars makes it easy to connect and earn extra income."
    },
    {
        name: "Priya Singh",
        role: "Travel Blogger",
        image: "https://randomuser.me/api/portraits/women/33.jpg",
        text: "I used CrucialCars to find unique vehicles for my road trip series. The variety of cars available was impressive, and the owners were fantastic!"
    },
    {
        name: "Arjun Kumar",
        role: "Automotive Photographer",
        image: "https://randomuser.me/api/portraits/men/75.jpg",
        text: "Finding unique cars for photoshoots has never been easier. CrucialCars has become my go-to platform for discovering eye-catching vehicles."
    }
];

// Seed function
const seedTestimonials = async () => {
    try {
        // Clear existing testimonials
        await Testimonial.deleteMany();
        console.log('Existing testimonials deleted'.red.inverse);

        // Add new testimonials
        const createdTestimonials = await Testimonial.insertMany(testimonials);
        console.log(`${createdTestimonials.length} testimonials inserted`.green.inverse);

        // Exit process with success
        process.exit(0);
    } catch (error) {
        console.error(`Error: ${error.message}`.red.bold);
        process.exit(1);
    }
};

// Run the seed function
seedTestimonials();
