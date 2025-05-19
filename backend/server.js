import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import './config/firebaseAdmin.js'; // Import to initialize
import carRoutes from './routes/carRoutes.js';
import userRoutes from './routes/userRoutes.js'; // <-- Imported
import requestRoutes from './routes/requestRoutes.js';
import testimonialRoutes from './routes/testimonialRoutes.js'; // <-- Added

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded files statically from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
    res.send('API is running...');
});

// --- Mount Routes ---
app.use('/api/users', userRoutes);     // Handle /api/users/* requests with userRoutes
app.use('/api/cars', carRoutes);         // Handle /api/cars/* requests with carRoutes
app.use('/api/requests', requestRoutes); // Handle /api/requests/* requests with requestRoutes
app.use('/api/testimonials', testimonialRoutes); // Handle /api/testimonials/* requests with testimonialRoutes


// --- Optional but Recommended Error Handling ---
// Should be placed AFTER your routes
// Not Found Handler
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
});

// General Error Handler
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));