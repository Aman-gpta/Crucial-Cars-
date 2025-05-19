// frontend/src/pages/RegisterPage.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook
import GoogleSignInButton from '../components/auth/GoogleSignInButton';

// Optional: Import a spinner component if you have one
// import Spinner from '../components/layout/Spinner';

const RegisterPage = () => {
    // --- Component State ---
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState(''); // User must select a role
    const [message, setMessage] = useState(''); // Local messages (e.g., password mismatch)

    // --- Auth Context ---
    const {
        register,         // Function for email/password registration
        userInfo,         // Current logged-in user info (or null)
        isLoading,        // Boolean indicating if an auth operation is in progress
        error: authError, // Holds error messages from auth operations
        setError: setAuthError, // Function to clear errors in the context
    } = useAuth();

    // --- Routing Hooks ---
    const navigate = useNavigate();
    const location = useLocation();

    // --- Effects ---

    // Effect to clear any previous auth errors when the page loads or changes
    useEffect(() => {
        setAuthError(null);
        setMessage(''); // Clear local messages too
    }, [location, setAuthError]);

    // Effect to redirect the user if they are already logged in
    useEffect(() => {
        if (userInfo) {
            navigate('/'); // Redirect logged-in users away from register page
        }
    }, [userInfo, navigate]);

    // --- Event Handlers ---

    const handleRegister = async (e) => {
        e.preventDefault(); // Prevent page reload
        setAuthError(null); // Clear previous context errors
        setMessage('');     // Clear previous local messages

        // Client-side validation
        if (!role) {
            setMessage('Please select a role.');
            return;
        }
        if (password !== confirmPassword) {
            setMessage('Passwords do not match.');
            return;
        }
        if (password.length < 6) { // Basic length check (optional, backend validates too)
            setMessage('Password must be at least 6 characters long.');
            return;
        }

        // Call register function from context
        const success = await register(name, email, password, role);

        if (success) {
            // Registration automatically logs the user in via the context
            // Navigation is handled by the useEffect hook watching userInfo
            // navigate('/'); // Or navigate directly here if preferred
        }
        // Error display is handled by rendering {authError} from context
    };

    // --- Render ---
    return (
        <div className="flex justify-center items-start min-h-[calc(100vh-150px)] py-10 px-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 space-y-6">
                <h2 className="text-3xl font-bold text-center text-gray-800">
                    Create Account
                </h2>

                {/* --- Registration Form --- */}
                <form onSubmit={handleRegister} className="space-y-5">
                    {/* Name Input */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                        </label>
                        <input
                            id="name" name="name" type="text" required value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input-field" // Reusable class (optional, define below or keep inline)
                            placeholder="Your Name"
                        />
                    </div>

                    {/* Email Input */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email address
                        </label>
                        <input
                            id="email" name="email" type="email" autoComplete="email" required value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field"
                            placeholder="you@example.com"
                        />
                    </div>

                    {/* Password Input */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            id="password" name="password" type="password" autoComplete="new-password" required value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field"
                            placeholder="******** (min. 6 characters)"
                        />
                    </div>

                    {/* Confirm Password Input */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="input-field"
                            placeholder="********"
                        />
                    </div>

                    {/* Role Selection */}
                    <div>
                        <label htmlFor="role-select-reg" className="block text-sm font-medium text-gray-700 mb-1">
                            I am a...
                        </label>
                        <select
                            id="role-select-reg" required value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            aria-label="Select your role"
                        >
                            <option value="" disabled>-- Select Role --</option>
                            <option value="Car Owner">Car Owner</option>
                            <option value="Journalist">Journalist</option>
                        </select>
                    </div>

                    {/* Loading Indicator */}
                    {isLoading && <p className="text-center text-sm text-blue-600">Registering...</p>}
                    {/* {isLoading && <Spinner />} */}

                    {/* Display Local Validation Error Message */}
                    {message && <p className="text-center text-sm text-yellow-700 bg-yellow-100 p-2 rounded border border-yellow-300">{message}</p>}

                    {/* Display Auth Error Message from Context */}
                    {authError && <p className="text-center text-sm text-red-600 bg-red-100 p-2 rounded border border-red-300">{authError}</p>}

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit" disabled={isLoading}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 transition duration-150 ease-in-out"
                        >
                            Register
                        </button>                    </div>
                </form>                {/* --- Divider --- */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-3 bg-white text-gray-500">Or</span>
                    </div>
                </div>

                {/* --- Google Sign-In --- */}
                <div className="space-y-4">
                    <p className="text-center text-sm font-medium text-gray-700 mb-2">
                        Sign up with Google using your selected role
                    </p>
                    {role && <GoogleSignInButton role={role} />}
                </div>

                {/* --- Link to Login Page --- */}
                <div className="mt-6 text-center text-sm">
                    <p className="text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
            {/* Basic reusable input style - can be moved to index.css */}
            <style jsx>{`
        .input-field {
          @apply appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out;
        }
      `}</style>
        </div>
    );
};

export default RegisterPage;