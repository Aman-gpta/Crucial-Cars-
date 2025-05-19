// frontend/src/pages/LoginPage.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Import routing hooks
import { useAuth } from '../context/AuthContext'; // Import custom hook for Auth Context
import { auth, googleProvider } from '../firebase'; // Import Firebase auth config
import { signInWithPopup } from 'firebase/auth';
 // <-- Check this path

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
    }, [userInfo, navigate]); // Runs when userInfo or navigate changes

    // --- Event Handlers ---

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

    // Handle Google Sign-In button click
    const handleGoogleSignIn = async () => {
        // Ensure a role is selected, as this is needed if it's a new user signing up via Google
        if (!selectedRole) {
            setAuthError('Please select a role (Car Owner or Journalist) before signing in with Google.');
            return;
        }
        setAuthError(null); // Clear previous errors

        try {
            // 1. Trigger Firebase Google Sign-In Popup
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // 2. Get the Firebase ID Token from the signed-in user
            const idToken = await user.getIdToken();

            // 3. Call the context function to authenticate with your backend using the Firebase token
            const success = await loginWithFirebase(idToken, selectedRole);

            if (success) {
                // Navigation is handled by the useEffect hook watching userInfo
                // navigate('/'); // Or navigate directly here if preferred
            }
            // Error display is handled by rendering {authError}

        } catch (err) {
            // Handle errors specifically from the Firebase popup flow
            console.error("Firebase Popup/Auth Error:", err);
            let errorMessage = 'An error occurred during Google sign-in.';
            if (err.code === 'auth/popup-closed-by-user') {
                errorMessage = 'Google Sign-in cancelled.';
            } else if (err.message) {
                errorMessage = err.message;
            }
            setAuthError(errorMessage); // Set the error in the context
        }
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
                </div>

                {/* --- Google Sign-In Section --- */}
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
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={isLoading || !selectedRole} // Disable if loading or no role selected
                        type="button" // Important: type="button" prevents submitting the email form
                        className="w-full flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 transition duration-150 ease-in-out"
                    >
                        {/* Simple SVG Google Icon */}
                        <svg className="w-5 h-5 mr-3" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 261.8 0 120.5 109.8 8.8 244 8.8c77.7 0 142.5 31.4 190.6 78.6l-71.1 68.6C332.6 124.2 291.1 104 244 104c-69.9 0 -126.6 56-126.6 126.4s56.6 126.4 126.6 126.4c77.5 0 103.8-48.6 108.2-72.6H244v-89.4h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
                        {isLoading ? 'Processing...' : 'Sign in with Google'}
                    </button>
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