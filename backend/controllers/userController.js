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
    console.log(`Login attempt for email: ${email}`);

    try {
        // Find user by email, explicitly select password if needed for matchPassword method
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            console.log(`Login failed: No user found with email ${email}`);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check if password matches
        const passwordMatches = await user.matchPassword(password);
        if (passwordMatches) {
            // Generate JWT token
            const token = generateToken(user._id, user.role);
            console.log(`Login successful for user: ${user.name} (${user._id})`);
            console.log(`Generated token (first 15 chars): ${token.substring(0, 15)}...`);
            
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: token,
            });
        } else {
            console.log(`Login failed: Password incorrect for email ${email}`);
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ 
            message: 'Server error during login',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
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
        }        res.status(401).json({ message: 'Firebase authentication failed', error: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        // Check if req.user exists (set by auth middleware)
        if (!req.user || !req.user._id) {
            console.error('Missing user data in request');
            return res.status(401).json({ message: 'User authentication failed. Missing user data.' });
        }
        
        console.log(`Fetching profile for user ID: ${req.user._id}`);
        
        // Get user from database
        const user = await User.findById(req.user._id);
        
        if (!user) {
            console.error(`User with ID ${req.user._id} not found in database`);
            return res.status(404).json({ message: 'User profile not found' });
        }
        
        // Successfully found user, return profile data
        console.log(`Profile successfully retrieved for user: ${user.name}`);
        
        // Construct response data
        const responseData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileImage: user.profileImage || '',
            bio: user.bio || '',
            phone: user.phone || '',
            location: user.location || '',
            socialMedia: {
                youtube: user.socialMedia?.youtube || '',
                instagram: user.socialMedia?.instagram || '',
                twitter: user.socialMedia?.twitter || '',
                linkedin: user.socialMedia?.linkedin || '',
                website: user.socialMedia?.website || ''
            },
            journalistInfo: {
                publication: user.journalistInfo?.publication || '',
                experience: user.journalistInfo?.experience || 0,
                specialization: user.journalistInfo?.specialization || ''
            },
            ownerInfo: {
                preferredContactMethod: user.ownerInfo?.preferredContactMethod || 'email',
                businessName: user.ownerInfo?.businessName || ''
            }
        };
        
        console.log(`Sending profile response for user: ${user.name}`);
        res.json(responseData);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        
        // Return appropriate error status and message
        if (error.kind === 'ObjectId' || error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }
        
        res.status(500).json({ 
            message: 'Server error fetching profile',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        // req.user is set in the auth middleware
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Update basic user information
        user.name = req.body.name || user.name;
        user.profileImage = req.body.profileImage || user.profileImage;
        user.bio = req.body.bio || user.bio;
        user.phone = req.body.phone || user.phone;
        user.location = req.body.location || user.location;
        
        // Update social media links
        if (req.body.socialMedia) {
            user.socialMedia = {
                youtube: req.body.socialMedia.youtube || user.socialMedia?.youtube || '',
                instagram: req.body.socialMedia.instagram || user.socialMedia?.instagram || '',
                twitter: req.body.socialMedia.twitter || user.socialMedia?.twitter || '',
                linkedin: req.body.socialMedia.linkedin || user.socialMedia?.linkedin || '',
                website: req.body.socialMedia.website || user.socialMedia?.website || ''
            };
        }
        
        // Update role-specific information
        if (user.role === 'Journalist' && req.body.journalistInfo) {
            user.journalistInfo = {
                publication: req.body.journalistInfo.publication || user.journalistInfo?.publication || '',
                experience: req.body.journalistInfo.experience || user.journalistInfo?.experience || 0,
                specialization: req.body.journalistInfo.specialization || user.journalistInfo?.specialization || ''
            };
        }
        
        if (user.role === 'Car Owner' && req.body.ownerInfo) {
            user.ownerInfo = {
                preferredContactMethod: req.body.ownerInfo.preferredContactMethod || user.ownerInfo?.preferredContactMethod || 'email',
                businessName: req.body.ownerInfo.businessName || user.ownerInfo?.businessName || ''
            };
        }
        
        // Update password if provided
        if (req.body.password) {
            user.password = req.body.password;
        }
        
        const updatedUser = await user.save();
        
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            profileImage: updatedUser.profileImage || '',
            bio: updatedUser.bio || '',
            phone: updatedUser.phone || '',
            location: updatedUser.location || '',
            socialMedia: updatedUser.socialMedia || {
                youtube: '',
                instagram: '',
                twitter: '',
                linkedin: '',
                website: ''
            },
            journalistInfo: updatedUser.journalistInfo || {
                publication: '',
                experience: 0,
                specialization: ''
            },
            ownerInfo: updatedUser.ownerInfo || {
                preferredContactMethod: 'email',
                businessName: ''
            },
            token: generateToken(updatedUser._id, updatedUser.role)
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        
        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        
        res.status(500).json({ message: 'Server error updating profile' });
    }
};

// @desc    Get public user profile by ID
// @route   GET /api/users/:id
// @access  Public
const getUserPublicProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Return only public information
        res.json({
            _id: user._id,
            name: user.name,
            role: user.role,
            profileImage: user.profileImage || '',
            bio: user.bio || '',
            location: user.location || '',
            socialMedia: user.socialMedia || {
                youtube: '',
                instagram: '',
                twitter: '',
                linkedin: '',
                website: ''
            },
            // Only include role-specific information that should be public
            ...(user.role === 'Journalist' && {
                journalistInfo: {
                    publication: user.journalistInfo?.publication || '',
                    specialization: user.journalistInfo?.specialization || ''
                }
            }),
            ...(user.role === 'Car Owner' && {
                ownerInfo: {
                    businessName: user.ownerInfo?.businessName || ''
                }
            })
        });
    } catch (error) {
        console.error('Error fetching public user profile:', error);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
};

// Export all three functions
export { registerUser, loginUser, authWithFirebase, getUserProfile, updateUserProfile, getUserPublicProfile };