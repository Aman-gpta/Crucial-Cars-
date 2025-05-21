// frontend/src/pages/LoginPage.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Import routing hooks
import { useAuth } from '../context/AuthContext'; // Import custom hook for Auth Context
import GoogleSignInButton from '../components/auth/GoogleSignInButton';
import Spinner from '../components/layout/Spinner'; // Import the Spinner component

const LoginPage = () => {
    const { 
        login, 
        // loginWithFirebase, // Not used in this component
        userInfo, // Added userInfo
        error: authError, // Keep alias for error state if preferred
        setError, // Use setError directly
        isLoading 
    } = useAuth();

    // --- Component State ---
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState(''); // Role selection for Google Sign-Up

    // --- Routing Hooks ---
    const navigate = useNavigate();
    const location = useLocation();

    // --- Effects ---

    // Effect to clear any previous auth errors when the page loads or changes
    useEffect(() => {
        // Clear any auth errors when the component mounts or location changes
        setError(null);
    }, [location, setError]); // Dependency array includes setError (stable)

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
        setError(null); // Clear previous errors
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
        <div className="flex justify-center items-start min-h-[calc(100vh-150px)] py-10 px-4 animate-fadeIn"> {/* Adjust min-height based on Navbar/Footer */}
            {/* Login card styled with Tailwind */}            <div className="w-full max-w-md bg-theme-black-900 bg-opacity-70 rounded-xl shadow-purple-glow p-8 space-y-6 backdrop-blur-sm border border-theme-purple-800 animate-slideInUp">
                <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-purple-gradient">
                    Sign In
                </h2>

                {/* --- Email/Password Login Form --- */}
                <form onSubmit={handleEmailPasswordLogin} className="space-y-5">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-theme-purple-200 mb-1"
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
                            className="appearance-none block w-full px-3 py-2 bg-theme-black-800 border border-theme-purple-600 rounded-md shadow-sm placeholder-theme-black-400 focus:outline-none focus:ring-theme-purple-500 focus:border-theme-purple-500 sm:text-sm transition duration-300 ease-in-out text-white"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-theme-purple-200 mb-1"
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
                            className="appearance-none block w-full px-3 py-2 bg-theme-black-800 border border-theme-purple-600 rounded-md shadow-sm placeholder-theme-black-400 focus:outline-none focus:ring-theme-purple-500 focus:border-theme-purple-500 sm:text-sm transition duration-300 ease-in-out text-white"
                            placeholder="********"
                        />
                        {/* Optional: Add 'Forgot Password?' link here */}                    </div>

                    {/* Display Loading Indicator for form submission */}
                    {isLoading && <Spinner size="small" />}

                    {/* Display Authentication Error Message */}
                    {authError && <p className="text-center text-sm text-red-500 bg-red-900 bg-opacity-30 p-2 rounded border border-red-700 animate-pulse">{authError}</p>}

                    {/* Submit Button for Email/Password Form */}
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-purple-glow text-sm font-medium text-white gradient-button disabled:opacity-60 transition-all duration-300 transform hover:scale-105"
                        >
                            Sign in
                        </button>
                    </div>
                </form>

                {/* --- Divider --- */}
                <div className="relative my-6"> {/* Added margin */}
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-theme-purple-700" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-3 bg-theme-black-900 text-theme-purple-300">Or</span>
                    </div>
                </div>                {/* --- Google Sign-In Section --- */}
                <div className="space-y-4">
                    <div> {/* Encapsulate role select */}
                        <label htmlFor="role-select" className="block text-sm font-medium text-theme-purple-200 mb-1">
                            Select Role (for Google Sign-Up)
                        </label>
                        <select
                            id="role-select"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="block w-full px-3 py-2 bg-theme-black-800 border border-theme-purple-600 text-white rounded-md shadow-sm focus:outline-none focus:ring-theme-purple-500 focus:border-theme-purple-500 sm:text-sm transition-all duration-300"
                            aria-label="Select your role if signing up with Google"
                        >
                            <option value="" disabled>-- Select Role --</option>
                            <option value="Car Owner">I'm a Car Owner</option>
                            <option value="Journalist">I'm a Journalist</option>
                        </select>
                    </div>

                    {/* Google Sign-In Button */}
                    {selectedRole && <GoogleSignInButton role={selectedRole} />}
                    {!selectedRole && (
                        <p className="text-sm text-theme-purple-300 text-center animate-pulse">
                            Please select a role above to enable Google Sign-In
                        </p>
                    )}
                </div>

                {/* --- Link to Register Page --- */}
                <div className="mt-8 text-center text-sm"> {/* Added margin top */}
                    <p className="text-theme-purple-200">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-medium text-theme-purple-400 hover:text-theme-purple-300 transition-all duration-300 hover:underline">
                            Sign up here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;