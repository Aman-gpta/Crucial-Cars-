// backend/models/TestDriveRequestModel.js
import mongoose from 'mongoose';

const testDriveRequestSchema = new mongoose.Schema(
    {
        // Journalist who made the request
        journalist: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User', // References the 'User' model
        },
        // Car being requested for a test drive
        car: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Car', // References the 'Car' model
        },
        // Owner of the requested car (denormalized for easier querying by owner)
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User', // References the 'User' model
        },
        // Requested date/time (optional, could be a free text message instead)
        requestedDateTime: {
            type: Date, // Or String if you prefer more flexibility initially
            required: false,
        },
        // Additional message from the journalist (optional)
        message: {
            type: String,
            trim: true,
            required: false,
        },
        // Status of the request
        status: {
            type: String,
            required: true,
            enum: ['Pending', 'Approved', 'Rejected', 'Completed'], // Define possible statuses
            default: 'Pending',
        },
        // Optional: Response message from the owner
        ownerResponse: {
            type: String,
            trim: true,
            required: false,
        }
    },
    {
        timestamps: true, // Adds createdAt and updatedAt
    }
);

// Optional: Indexing for faster lookups
testDriveRequestSchema.index({ journalist: 1, status: 1 }); // Journalist looking at their requests
testDriveRequestSchema.index({ owner: 1, status: 1 }); // Owner looking at incoming requests
testDriveRequestSchema.index({ car: 1 }); // Find requests for a specific car
// Index for faster lookup of active requests by journalist and car
testDriveRequestSchema.index({ journalist: 1, car: 1, status: 1 });

// Compile the schema into a model
const TestDriveRequest = mongoose.model(
    'TestDriveRequest', // The name of the model
    testDriveRequestSchema // The schema definition
);

export default TestDriveRequest; // Export the model