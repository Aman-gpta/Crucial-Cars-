// frontend/src/pages/LoginPage.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Import routing hooks
import { useAuth } from '../context/AuthContext'; // Import custom hook for Auth Context
import GoogleSignInButton from '../components/auth/GoogleSignInButton';

// Optional: Import a spinner component if you have one
// import Spinner from '../components/layout/Spinner';

const LoginPage = () => {
    // --- Component State ---
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState(''); // Role selection for Google Sign-Up

    // --- Auth Context ---
    // Get functions and state needed from the AuthContext
    const {
        login,              // Function for email/password login
        loginWithFirebase,  // Function for Firebase login
        userInfo,           // Current logged-in user info (or null)
        isLoading,          // Boolean indicating if an auth operation is in progress
        error: authError,   // Holds error messages from auth operations
        setError: setAuthError, // Function to clear errors in the context
    } = useAuth();

    // --- Routing Hooks ---
    const navigate = useNavigate();
    const location = useLocation();

    // --- Effects ---

    // Effect to clear any previous auth errors when the page loads or changes
    useEffect(() => {
        setAuthError(null);
    }, [location, setAuthError]); // Dependency array includes setAuthError

    // Effect to redirect the user if they are already logged in
    useEffect(() => {
        if (userInfo) {
            // Redirect to home page or a specific dashboard based on role
            // const redirectPath = userInfo.role === 'Car Owner' ? '/owner/dashboard' : '/journalist/dashboard';
            const redirectPath = '/'; // Redirect to home page for now
            navigate(redirectPath);
        }
    }, [userInfo, navigate]); // Runs when userInfo or navigate changes    // --- Event Handlers ---

    // Handle standard email/password form submission
    const handleEmailPasswordLogin = async (e) => {
        e.preventDefault(); // Prevent page reload
        setAuthError(null); // Clear previous errors
        const success = await login(email, password); // Call login from context
        if (success) {
            // Navigation is handled by the useEffect hook watching userInfo
            // navigate('/'); // Or navigate directly here if preferred
        }
        // Error display is handled by rendering {authError}
    };

    // --- Render ---
    return (
        // Main container centered with padding
        <div className="flex justify-center items-start min-h-[calc(100vh-150px)] py-10 px-4"> {/* Adjust min-height based on Navbar/Footer */}
            {/* Login card styled with Tailwind */}
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 space-y-6">
                <h2 className="text-3xl font-bold text-center text-gray-800">
                    Sign In
                </h2>

                {/* --- Email/Password Login Form --- */}
                <form onSubmit={handleEmailPasswordLogin} className="space-y-5">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                            placeholder="********"
                        />
                        {/* Optional: Add 'Forgot Password?' link here */}
                    </div>

                    {/* Display Loading Indicator for form submission */}
                    {isLoading && <p className="text-center text-sm text-blue-600">Processing...</p>}
                    {/* {isLoading && <Spinner />} */}

                    {/* Display Authentication Error Message */}
                    {authError && <p className="text-center text-sm text-red-600 bg-red-100 p-2 rounded border border-red-300">{authError}</p>}

                    {/* Submit Button for Email/Password Form */}
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 transition duration-150 ease-in-out"
                        >
                            Sign in
                        </button>
                    </div>
                </form>

                {/* --- Divider --- */}
                <div className="relative my-6"> {/* Added margin */}
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-3 bg-white text-gray-500">Or</span>
                    </div>
                </div>                {/* --- Google Sign-In Section --- */}
                <div className="space-y-4">
                    <div> {/* Encapsulate role select */}
                        <label htmlFor="role-select" className="block text-sm font-medium text-gray-700 mb-1">
                            Select Role (for Google Sign-Up)
                        </label>
                        <select
                            id="role-select"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            aria-label="Select your role if signing up with Google"
                        >
                            <option value="" disabled>-- Select Role --</option>
                            <option value="Car Owner">I'm a Car Owner</option>
                            <option value="Journalist">I'm a Journalist</option>
                        </select>
                    </div>

                    {/* Google Sign-In Button */}
                    {selectedRole && <GoogleSignInButton role={selectedRole} />}
                </div>

                {/* --- Link to Register Page --- */}
                <div className="mt-8 text-center text-sm"> {/* Added margin top */}
                    <p className="text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Sign up here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;