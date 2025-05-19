// backend/utils/generateToken.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); // Ensure environment variables are loaded

const generateToken = (userId, userRole) => {
    // Make sure JWT_SECRET is loaded from .env
    if (!process.env.JWT_SECRET) {
        console.error("Fatal Error: JWT_SECRET is not defined in .env file.");
        process.exit(1); // Exit if secret is missing - critical error
    }

    return jwt.sign(
        { id: userId, role: userRole }, // Payload: include user ID and role
        process.env.JWT_SECRET,         // Your secret key from .env
        {
            expiresIn: '30d', // Token expiration time (e.g., 30 days)
        }
    );
};

export default generateToken;