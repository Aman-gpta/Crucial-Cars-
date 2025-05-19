// backend/routes/carRoutes.js
import express from 'express';
import {
    // Import all necessary controller functions from carController.js
    createCar,
    getCars,
    getMyCars,
    getCarById,
    updateCar,
    deleteCar,
    toggleAvailability,
} from '../controllers/carController.js';
import { protect, authorize } from '../middleware/authMiddleware.js'; // Import authentication middleware
import upload from '../middleware/uploadMiddleware.js'; // Import the upload middleware

// Initialize express router
const router = express.Router();

// ====================
// --- Public Routes ---
// ====================

/**
 * @route   GET /api/cars
 * @desc    Get all available cars (supports ?keyword= search)
 * @access  Public
 */
router.get('/', getCars);

// =======================
// --- Protected Routes ---
// =======================

/**
 * @route   GET /api/cars/my-listings/owner
 * @desc    Get all cars listed by the currently logged-in Car Owner
 * @access  Private (Requires login as 'Car Owner')
 */
router.get('/my-listings/owner', protect, authorize('Car Owner'), getMyCars);

/**
 * @route   GET /api/cars/:id
 * @desc    Get details of a single car by its ID
 * @access  Public
 */
router.get('/:id', getCarById);

/**
 * @route   POST /api/cars
 * @desc    Create a new car listing
 * @access  Private (Requires login and 'Car Owner' role)
 */
router.post('/', protect, authorize('Car Owner'), upload.single('image'), createCar);

/**
 * @route   PUT /api/cars/:id
 * @desc    Update a specific car listing owned by the logged-in user
 * @access  Private (Requires login as 'Car Owner' who owns the car)
 */
router.put('/:id', protect, authorize('Car Owner'), upload.single('image'), updateCar);

/**
 * @route   DELETE /api/cars/:id
 * @desc    Delete a specific car listing owned by the logged-in user
 * @access  Private (Requires login as 'Car Owner' who owns the car)
 */
router.delete('/:id', protect, authorize('Car Owner'), deleteCar);

/**
 * @route   PATCH /api/cars/:id/toggle-availability
 * @desc    Toggle the availability status of a specific car listing owned by the logged-in user
 * @access  Private (Requires login as 'Car Owner' who owns the car)
 */
router.patch('/:id/toggle-availability', protect, authorize('Car Owner'), toggleAvailability);


// Export the router to be used in server.js
export default router;