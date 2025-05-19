// backend/routes/testimonialRoutes.js
import express from 'express';
import {
    getTestimonials,
    getTestimonialById,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial
} from '../controllers/testimonialController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Routes for /api/testimonials
router.route('/')
    .get(getTestimonials)                     // Public access
    .post(protect, admin, createTestimonial); // Admin only

// Routes for /api/testimonials/:id
router.route('/:id')
    .get(getTestimonialById)                   // Public access
    .put(protect, admin, updateTestimonial)    // Admin only
    .delete(protect, admin, deleteTestimonial); // Admin only

export default router;
