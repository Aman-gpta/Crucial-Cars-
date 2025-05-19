// backend/routes/requestRoutes.js
import express from 'express';
import {
    createRequest,
    getIncomingRequests,
    getOutgoingRequests,
    updateRequestStatus,
    getRequestById,
} from '../controllers/requestController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Protected Routes ---

// Journalist creates a new request
router.post('/', protect, authorize('Journalist'), createRequest);

// Owner gets requests for their cars
router.get('/incoming', protect, authorize('Car Owner'), getIncomingRequests);

// Journalist gets requests they have sent
router.get('/outgoing', protect, authorize('Journalist'), getOutgoingRequests);

// Owner updates the status of a request (Approve/Reject/Complete)
router.put('/:id/status', protect, authorize('Car Owner'), updateRequestStatus);

// Get details of a specific request (accessible by the journalist who sent it or the owner who received it)
router.get('/:id', protect, getRequestById);


export default router;