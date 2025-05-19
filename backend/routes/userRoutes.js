// backend/routes/userRoutes.js
import express from 'express';
// Import authWithFirebase
import { registerUser, loginUser, authWithFirebase } from '../controllers/userController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/firebase-auth', authWithFirebase); // <-- Add this route

export default router;