// backend/routes/testRoutes.js
import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Test route to check if auth middleware is working
router.get('/auth-check', protect, (req, res) => {
    res.json({ 
        message: 'Auth middleware is working correctly', 
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role
        } 
    });
});

// Test route for journalists only
router.get('/journalist-check', protect, authorize('Journalist'), (req, res) => {
    res.json({ 
        message: 'You are verified as a journalist', 
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role
        } 
    });
});

export default router;
