// backend/models/CarModel.js
import mongoose from 'mongoose';

const carSchema = new mongoose.Schema(
    {
        // Link to the Car Owner user who listed this car
        owner: {
            type: mongoose.Schema.Types.ObjectId, // Special type for referencing other documents
            required: true,
            ref: 'User', // Establishes a relationship with the 'User' model
        },
        make: {
            type: String,
            required: [true, 'Please provide the car make (e.g., Toyota, Ford)'],
            trim: true, // Remove leading/trailing whitespace
        },
        model: {
            type: String,
            required: [true, 'Please provide the car model (e.g., Camry, Mustang)'],
            trim: true,
        },
        year: {
            type: Number,
            required: [true, 'Please provide the manufacturing year'],
            min: [1900, 'Year must be 1900 or later'],
            max: [new Date().getFullYear() + 1, `Year cannot be in the future beyond ${new Date().getFullYear() + 1}`], // Allow next year's models
        },
        description: {
            type: String,
            required: [true, 'Please provide a description of the car'],
            trim: true,
        },
        location: {
            type: String,
            required: [true, 'Please provide the location of the car (e.g., city, area)'],
            trim: true,
        },
        // Single image path (for uploaded images)
        image: {
            type: String,
            required: [true, 'Please provide an image of the car'],
        },
        // For backward compatibility, keeping images array
        images: [
            {
                type: String, // Array of image URLs
                required: false,
            },
        ],
        // Availability status for test drives
        isAvailable: {
            type: Boolean,
            required: true,
            default: true, // Default to available when listed
        },
        // Additional fields
        color: {
            type: String,
            required: [true, 'Please provide the car color'],
            trim: true,
        },
        price: {
            type: Number,
            required: [true, 'Please provide the rental price per day'],
            min: [0, 'Price cannot be negative'],
        },
        mileage: {
            type: Number,
            required: [true, 'Please provide the car mileage'],
            min: [0, 'Mileage cannot be negative'],
        },
        transmission: {
            type: String,
            required: [true, 'Please specify the transmission type'],
            enum: ['Automatic', 'Manual', 'Semi-Automatic', 'CVT'],
        },
        fuelType: {
            type: String,
            required: [true, 'Please specify the fuel type'],
            enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid', 'LPG'],
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt automatically
    }
);

// Optional: Indexing for faster searching (Example)
carSchema.index({ make: 1, model: 1 }); // Index on make and model
carSchema.index({ location: 'text', description: 'text' }); // Text index for keyword searching

const Car = mongoose.model('Car', carSchema);

export default Car;