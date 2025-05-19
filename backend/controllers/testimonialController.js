// backend/controllers/testimonialController.js
import asyncHandler from 'express-async-handler';
import Testimonial from '../models/TestimonialModel.js';

/**
 * @desc    Fetch all testimonials
 * @route   GET /api/testimonials
 * @access  Public
 */
const getTestimonials = asyncHandler(async (req, res) => {
    const testimonials = await Testimonial.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(testimonials);
});

/**
 * @desc    Fetch a single testimonial by ID
 * @route   GET /api/testimonials/:id
 * @access  Public
 */
const getTestimonialById = asyncHandler(async (req, res) => {
    const testimonial = await Testimonial.findById(req.params.id);

    if (testimonial) {
        res.json(testimonial);
    } else {
        res.status(404);
        throw new Error('Testimonial not found');
    }
});

/**
 * @desc    Create a new testimonial
 * @route   POST /api/testimonials
 * @access  Private/Admin
 */
const createTestimonial = asyncHandler(async (req, res) => {
    const { name, role, image, text } = req.body;

    const testimonial = await Testimonial.create({
        name,
        role,
        image,
        text,
    });

    if (testimonial) {
        res.status(201).json(testimonial);
    } else {
        res.status(400);
        throw new Error('Invalid testimonial data');
    }
});

/**
 * @desc    Update a testimonial
 * @route   PUT /api/testimonials/:id
 * @access  Private/Admin
 */
const updateTestimonial = asyncHandler(async (req, res) => {
    const { name, role, image, text, isActive } = req.body;

    const testimonial = await Testimonial.findById(req.params.id);

    if (testimonial) {
        testimonial.name = name || testimonial.name;
        testimonial.role = role || testimonial.role;
        testimonial.image = image || testimonial.image;
        testimonial.text = text || testimonial.text;
        testimonial.isActive = isActive !== undefined ? isActive : testimonial.isActive;

        const updatedTestimonial = await testimonial.save();
        res.json(updatedTestimonial);
    } else {
        res.status(404);
        throw new Error('Testimonial not found');
    }
});

/**
 * @desc    Delete a testimonial
 * @route   DELETE /api/testimonials/:id
 * @access  Private/Admin
 */
const deleteTestimonial = asyncHandler(async (req, res) => {
    const testimonial = await Testimonial.findById(req.params.id);

    if (testimonial) {
        await testimonial.deleteOne();
        res.json({ message: 'Testimonial removed' });
    } else {
        res.status(404);
        throw new Error('Testimonial not found');
    }
});

export {
    getTestimonials,
    getTestimonialById,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
};
