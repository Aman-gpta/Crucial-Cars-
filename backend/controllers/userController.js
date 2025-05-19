// backend/controllers/userController.js
import User from '../models/UserModel.js';
import generateToken from '../utils/generateToken.js';
import admin from 'firebase-admin'; // Import initialized admin

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Validate role
        if (!['Car Owner', 'Journalist'].includes(role)) {
            return res.status(400).json({ message: 'Invalid user role specified' });
        }

        // Create new user (password hashing is handled by the pre-save hook in UserModel)
        const user = await User.create({
            name,
            email,
            password, // Password is required here as it's not a Firebase user yet
            role,
        });

        if (user) {
            // User created successfully, respond with user info and token
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role), // Generate JWT
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Error during registration:', error);
        // Handle Mongoose validation errors specifically
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email, explicitly select password if needed for matchPassword method
        // Mongoose instance methods often handle this, but being explicit can help.
        const user = await User.findOne({ email }).select('+password');

        // Check if user exists and password matches
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role), // Generate JWT
            });
        } else {
            // Use 401 for unauthorized access
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};


// @desc    Authenticate user via Firebase ID Token & get app token
// @route   POST /api/users/firebase-auth
// @access  Public
const authWithFirebase = async (req, res) => {
    const { firebaseToken, role } = req.body; // Get token and ROLE from frontend

    if (!firebaseToken || !role) {
        return res.status(400).json({ message: 'Firebase token and role are required' });
    }

    // Validate role
    if (!['Car Owner', 'Journalist'].includes(role)) {
        return res.status(400).json({ message: 'Invalid user role specified' });
    }

    try {
        // Verify the Firebase ID token
        const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
        const { uid, email, name } = decodedToken; // Extract Firebase user info

        // Find user by email in your DB
        let user = await User.findOne({ email });

        if (user) {
            // User exists - optionally update firebaseUid if missing
            if (!user.firebaseUid) {
                user.firebaseUid = uid;
                await user.save();
            }
            // NOTE: We trust the role already stored in our DB for existing users
        } else {
            // User does not exist - create a new user in your DB
            user = await User.create({
                firebaseUid: uid,
                email: email,
                name: name || 'Firebase User', // Use name from Firebase, or default
                role: role, // Assign role provided during signup
                // No password needed/provided for Firebase users
            });
        }

        // Generate YOUR application's JWT
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role), // Your app's token
        });

    } catch (error) {
        console.error('Firebase Auth Error:', error);
        if (error.code === 'auth/id-token-expired') {
            return res.status(401).json({ message: 'Firebase token expired' });
        }
        if (error.code === 'auth/argument-error') {
            return res.status(401).json({ message: 'Invalid Firebase token' });
        }
        res.status(401).json({ message: 'Firebase authentication failed', error: error.message });
    }
};

// Export all three functions
export { registerUser, loginUser, authWithFirebase };