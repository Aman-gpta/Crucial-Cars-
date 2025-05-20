// frontend/src/pages/RegisterPage.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook
import GoogleSignInButton from '../components/auth/GoogleSignInButton';
import Spinner from '../components/layout/Spinner'; // Import the Spinner component

const RegisterPage = () => {
    // --- Component State ---
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState(''); // Local messages (e.g., password mismatch)
    const [role, setRole] = useState(''); // New state for role selection

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
        if (password !== confirmPassword) {
            setMessage('Passwords do not match.');
            return;
        }
        if (password.length < 6) { // Basic length check (optional, backend validates too)
            setMessage('Password must be at least 6 characters long.');
            return;
        }

        // Call register function from context
        const success = await register(name, email, password, role); // Use selected role

        if (success) {
            // Registration automatically logs the user in via the context
            // Navigation is handled by the useEffect hook watching userInfo
            // navigate('/'); // Or navigate directly here if preferred
        }
        // Error display is handled by rendering {authError} from context
    };    // --- Render ---
    return (
        <div className="flex justify-center items-start min-h-[calc(100vh-150px)] py-10 px-4 animate-fadeIn">            <div className="w-full max-w-md bg-theme-black-900 bg-opacity-70 rounded-xl shadow-purple-glow p-8 space-y-6 backdrop-blur-sm border border-theme-purple-800 animate-slideInUp">
                <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-purple-gradient">
                    Create Account
                </h2>

                {/* --- Registration Form --- */}
                <form onSubmit={handleRegister} className="space-y-5">
                    {/* Name Input */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-theme-purple-200 mb-1">
                            Full Name
                        </label>
                        <input
                            id="name" name="name" type="text" required value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="appearance-none block w-full px-3 py-2 bg-white border border-theme-purple-600 rounded-md shadow-sm text-black placeholder-gray-500 focus:outline-none focus:ring-theme-purple-500 focus:border-theme-purple-500 sm:text-sm transition duration-300 ease-in-out"
                            placeholder="Your Name"
                        />
                    </div>

                    {/* Email Input */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-theme-purple-200 mb-1">
                            Email address
                        </label>
                        <input
                            id="email" name="email" type="email" autoComplete="email" required value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="appearance-none block w-full px-3 py-2 bg-white border border-theme-purple-600 rounded-md shadow-sm text-black placeholder-gray-500 focus:outline-none focus:ring-theme-purple-500 focus:border-theme-purple-500 sm:text-sm transition duration-300 ease-in-out"
                            placeholder="you@example.com"
                        />
                    </div>

                    {/* Password Input */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-theme-purple-200 mb-1">
                            Password
                        </label>
                        <input
                            id="password" name="password" type="password" autoComplete="new-password" required value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="appearance-none block w-full px-3 py-2 bg-white border border-theme-purple-600 rounded-md shadow-sm text-black placeholder-gray-500 focus:outline-none focus:ring-theme-purple-500 focus:border-theme-purple-500 sm:text-sm transition duration-300 ease-in-out"
                            placeholder="******** (min. 6 characters)"
                        />
                    </div>

                    {/* Confirm Password Input */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-theme-purple-200 mb-1">
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="appearance-none block w-full px-3 py-2 bg-white border border-theme-purple-600 rounded-md shadow-sm text-black placeholder-gray-500 focus:outline-none focus:ring-theme-purple-500 focus:border-theme-purple-500 sm:text-sm transition duration-300 ease-in-out"
                            placeholder="********"
                        />
                    </div>

                    {/* Role Selection Dropdown */}
                    <div>
                        <label htmlFor="role-select-reg" className="block text-sm font-medium text-theme-purple-200 mb-1">
                            I am a...
                        </label>
                        <div className="mt-1">
                            <select
                                id="role"
                                name="role"
                                value={role}
                                onChange={e => setRole(e.target.value)}
                                required
                                className="block w-full px-3 py-2 bg-theme-black-800 border border-theme-purple-600 text-white rounded-md shadow-sm focus:outline-none focus:ring-theme-purple-500 focus:border-theme-purple-500 sm:text-sm transition-all duration-300"
                                aria-label="Select your role"
                            >
                                <option value="" disabled className="text-white bg-theme-black-800">
                                    -- Select Role --
                                </option>
                                <option value="Car Owner" className="text-white bg-theme-black-800">
                                    Car Owner
                                </option>
                                <option value="Journalist" className="text-white bg-theme-black-800">
                                    Journalist
                                </option>
                            </select>
                        </div>
                    </div>

                    {/* Loading Indicator */}
                    {isLoading && <Spinner size="small" />}

                    {/* Display Local Validation Error Message */}
                    {message && <p className="text-center text-sm text-yellow-300 bg-yellow-900 bg-opacity-30 p-2 rounded border border-yellow-700 animate-pulse">{message}</p>}

                    {/* Display Auth Error Message from Context */}
                    {authError && <p className="text-center text-sm text-red-500 bg-red-900 bg-opacity-30 p-2 rounded border border-red-700 animate-pulse">{authError}</p>}

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit" disabled={isLoading}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-purple-glow text-sm font-medium text-white gradient-button disabled:opacity-60 transition-all duration-300 transform hover:scale-105"
                        >
                            Register
                        </button>                    </div>
                </form>                {/* --- Divider --- */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-theme-purple-700" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-3 bg-theme-black-900 text-theme-purple-300">Or</span>
                    </div>
                </div>

                {/* --- Google Sign-In --- */}
                <div className="space-y-4">
                    <p className="text-center text-sm font-medium text-theme-purple-200 mb-2">
                        Sign up with Google using your selected role
                    </p>
                    <GoogleSignInButton role="Journalist" />
                </div>

                {/* --- Link to Login Page --- */}
                <div className="mt-6 text-center text-sm">
                    <p className="text-theme-purple-200">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-theme-purple-400 hover:text-theme-purple-300 transition-all duration-300 hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
            {/* Basic reusable input style - can be moved to index.css */}
            <style jsx global>{`
        .input-field {
          @apply appearance-none block w-full px-3 py-2 bg-white border border-theme-purple-600 rounded-md shadow-sm text-black placeholder-gray-500 focus:outline-none focus:ring-theme-purple-500 focus:border-theme-purple-500 sm:text-sm transition duration-300 ease-in-out;
        }
      `}</style>
        </div>
    );
};

export default RegisterPage;