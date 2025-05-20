// backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/UserModel.js'; // Need to find the user from the token payload
import dotenv from 'dotenv';

dotenv.config();

// Middleware to protect routes - checks for valid JWT
const protect = async (req, res, next) => {
    let token;
    
    console.log('Auth middleware triggered');
    console.log('Headers:', JSON.stringify(req.headers));

    // 1. Check if the token exists in the Authorization header and starts with 'Bearer'
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // 2. Extract the token string (remove 'Bearer ')
            token = req.headers.authorization.split(' ')[1];
            
            if (!token || token === 'null' || token === 'undefined') {
                console.error('Token is empty, null, or undefined');
                return res.status(401).json({ message: 'Not authorized, invalid token format' });
            }
            
            console.log(`Token received: ${token.substring(0, 10)}...`);

            // 3. Verify the token using the secret key
            if (!process.env.JWT_SECRET) {
                console.error('JWT_SECRET is not defined in environment variables');
                return res.status(500).json({ message: 'Server configuration error' });
            }
            
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                console.log(`Token verified for user ID: ${decoded.id}`);
                
                // 4. Find the user associated with the token's ID
                //    Attach the user object to the request, excluding the password
                console.log(`Looking up user with ID: ${decoded.id}`);
                if (!decoded.id || decoded.id === 'undefined' || decoded.id === 'null') {
                    console.error('Invalid ID in token:', decoded.id);
                    return res.status(401).json({ message: 'Not authorized, invalid user ID in token' });
                }
                
                req.user = await User.findById(decoded.id).select('-password');

                if (!req.user) {
                    // Edge case: Token is valid, but user doesn't exist anymore
                    console.error(`User with ID ${decoded.id} not found in database`);
                    return res.status(401).json({ message: 'Not authorized, user not found' });
                }
                
                console.log(`User authenticated: ${req.user.name} (${req.user._id})`);

                // 5. Call next() to proceed to the next middleware or route handler
                next();
            } catch (dbError) {
                console.error('Database error in auth middleware:', dbError);
                if (dbError.kind === 'ObjectId') {
                    return res.status(400).json({ message: 'Invalid user ID format in token' });
                }
                return res.status(500).json({ message: 'Server error during authentication' });
            }

        } catch (error) {
            console.error('Token verification failed:', error);
            // Handle specific JWT errors
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Not authorized, token invalid' });
            }
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Not authorized, token expired' });
            }
            // General error for other verification issues
            return res.status(401).json({ 
                message: 'Not authorized, authentication failed',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // If no token is found in the header
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

// Optional: Middleware for role-based authorization (Example)
const authorize = (...roles) => {
    return (req, res, next) => {
        // Assumes 'protect' middleware has already run and attached req.user
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ // 403 Forbidden for role issues
                message: `User role '${req.user?.role}' is not authorized to access this route. Required roles: ${roles.join(', ')}`,
            });
        }
        next(); // User has the required role, proceed
    };
};

// Admin middleware - checks if the user is an admin
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

export { protect, authorize, admin }; // Export all middlewares