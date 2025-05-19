// backend/models/UserModel.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * Mongoose Schema for User documents.
 *
 * Represents both users who sign up with email/password and those
 * who authenticate via Firebase (e.g., Google Sign-in).
 */
const userSchema = new mongoose.Schema(
    {
        // User's full name
        name: {
            type: String,
            required: [true, 'Please provide a name'], // Added custom error message
        },
        // User's email address - used as the primary identifier
        email: {
            type: String,
            required: [true, 'Please provide an email'],
            unique: true, // Ensures no two users have the same email
            lowercase: true, // Store emails consistently in lowercase
            match: [ // Basic email format validation
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email address',
            ],
        },
        // User's password - Hashed before saving. Optional for Firebase users.
        password: {
            type: String,
            required: function () { return !this.firebaseUid; }, // Required only if NOT a Firebase user
            minlength: [6, 'Password must be at least 6 characters long'], // Basic length validation
            select: false, // Prevents password from being sent back in queries by default
        },
        // User's role within the application
        role: {
            type: String,
            required: [true, 'Please specify a user role'],
            enum: {
                values: ['Car Owner', 'Journalist'], // Only allows these specific values
                message: '{VALUE} is not a supported role. Must be "Car Owner" or "Journalist".',
            },
        },
        // Firebase Unique Identifier - Optional, used for Firebase Auth users
        firebaseUid: {
            type: String,
            unique: true, // Ensures uniqueness if provided
            sparse: true, // Allows multiple documents to have null/undefined for this field, but enforces uniqueness when set
        },
    },
    {
        // Automatically adds 'createdAt' and 'updatedAt' fields
        timestamps: true,
        // Optionally improve default query behavior (e.g., exclude __v)
        toJSON: { virtuals: true }, // Ensure virtuals are included if you add any
        toObject: { virtuals: true }
    }
);

// --- Mongoose Middleware: Password Hashing ---
// Runs BEFORE a 'save' operation on a User document.
userSchema.pre('save', async function (next) {
    // 1. Only run this function if the password field exists and was modified (or is new)
    //    We check !this.password because it's now optional.
    if (!this.isModified('password') || !this.password) {
        return next(); // Skip hashing if password wasn't set or modified
    }

    // 2. Hash the password
    try {
        // Generate salt (complexity factor = 10)
        const salt = await bcrypt.genSalt(10);
        // Hash the password with the generated salt
        this.password = await bcrypt.hash(this.password, salt);
        next(); // Proceed with saving the document
    } catch (error) {
        next(error); // Pass any error during hashing to the next middleware/error handler
    }
});

// --- Mongoose Instance Method: Compare Passwords ---
// Adds a method to each User document instance to compare a candidate password
// with the stored hashed password.
userSchema.methods.matchPassword = async function (enteredPassword) {
    // 'this.password' refers to the hashed password stored in the document instance
    // Note: Since password has `select: false`, we need to ensure it was explicitly selected
    // in the query if we need to call this method (e.g., during login).
    // However, findOne in the login controller implicitly fetches all fields needed for the instance method.
    if (!this.password) {
        // Should not happen if called after fetching a user with a password during login,
        // but good safety check.
        return false;
    }
    return await bcrypt.compare(enteredPassword, this.password);
};

// --- Create and Export the Model ---
// Compiles the schema into a Mongoose model.
// Mongoose will create/use a collection named 'users' (lowercase, pluralized) in MongoDB.
const User = mongoose.model('User', userSchema);

export default User;