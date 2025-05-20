// backend/routes/requestRoutes.js
import express from 'express';
import {
    createRequest,
    getIncomingRequests,
    getOutgoingRequests,
    updateRequestStatus,
    getRequestById,
    checkExistingRequest,
    withdrawRequest,
} from '../controllers/requestController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Protected Routes ---

// Journalist creates a new request
router.post('/', protect, authorize('Journalist'), createRequest);

// IMPORTANT: These specific routes must come BEFORE the '/:id' routes
// to prevent route conflicts
// Owner gets requests for their cars
router.get('/incoming', protect, authorize('Car Owner'), getIncomingRequests);

// Journalist gets requests they have sent
router.get('/outgoing', protect, authorize('Journalist'), getOutgoingRequests);

// Check if journalist has an existing request for a car
router.get('/check/:carId', protect, authorize('Journalist'), checkExistingRequest);

// NOW the routes with :id parameters
// Owner updates the status of a request (Approve/Reject/Complete)
router.put('/:id/status', protect, authorize('Car Owner'), updateRequestStatus);

// Withdraw (cancel) a pending request
router.delete('/:id', protect, authorize('Journalist'), withdrawRequest);

// Get details of a specific request (accessible by the journalist who sent it or the owner who received it)
router.get('/:id', protect, getRequestById);


export default router;