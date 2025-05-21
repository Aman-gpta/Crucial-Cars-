// backend/routes/userRoutes.js
import express from 'express';
// Import authWithFirebase
import { 
    registerUser, 
    loginUser, 
    authWithFirebase,
    getUserProfile,
    updateUserProfile,
    getUserPublicProfile
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/firebase-auth', authWithFirebase);

// Protected routes
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

// Public route for specific user profiles (must be after /profile)
router.get('/:id', getUserPublicProfile);

export default router;