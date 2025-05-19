// backend/models/TestimonialModel.js
import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide the name of the person'],
            trim: true,
        },
        role: {
            type: String,
            required: [true, 'Please provide the role or profession'],
            trim: true,
        },
        image: {
            type: String,
            required: [true, 'Please provide an image URL'],
        },
        text: {
            type: String,
            required: [true, 'Please provide the testimonial text'],
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt timestamps
    }
);

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

export default Testimonial;
