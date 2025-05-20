import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api'; // Use our configured API service instead of direct axios

// --- Create Context ---
const AuthContext = createContext();

// --- Create Provider Component ---
export const AuthProvider = ({ children }) => {
    const [userInfo, setUserInfo] = useState(null); // Holds user data {_id, name, email, role, token}
    const [loading, setLoading] = useState(true); // Track initial loading from storage
    const [error, setError] = useState(null); // Holds auth-related errors

    // --- Effect to Load User from Local Storage on Initial Mount ---
    useEffect(() => {
        const storedUserInfo = localStorage.getItem('userInfo');
        if (storedUserInfo) {
            try {
                setUserInfo(JSON.parse(storedUserInfo));
            } catch (e) {
                console.error("Error parsing stored user info:", e);
                localStorage.removeItem('userInfo'); // Clear invalid data
            }
        }
        setLoading(false); // Finished loading initial state
    }, []); // Empty dependency array means run only once on mount    // --- Login Function ---
    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {            
            console.log('Attempting login for:', email);
            console.log('Login request URL:', `${api.defaults.baseURL}/users/login`);
            
            // Add detailed error handling and logging
            try {
                const { data } = await api.post(
                    '/users/login',
                    { email, password }
                );

                console.log('Login successful, received data:', data);
                
                if (!data.token) {
                    throw new Error('No authentication token received from server');
                }
                
                // Log first part of token for debugging
                console.log(`Token received (first 15 chars): ${data.token.substring(0, 15)}...`);

                setUserInfo(data); // Update state with user data from backend response
                localStorage.setItem('userInfo', JSON.stringify(data)); // Store in local storage
                
                // Check if token is successfully stored
                const storedData = localStorage.getItem('userInfo');
                if (storedData) {
                    const parsedData = JSON.parse(storedData);
                    console.log(`Token stored in localStorage: ${parsedData.token ? 'Yes' : 'No'}`);
                }
                
                setLoading(false);
                return true; // Indicate success
            } catch (axiosError) {
                console.error('Axios error details:', axiosError);
                
                // Log specific error information for debugging
                if (axiosError.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    console.error('Response error data:', axiosError.response.data);
                    console.error('Response status:', axiosError.response.status);
                    console.error('Response headers:', axiosError.response.headers);
                    throw new Error(axiosError.response.data.message || 'Server responded with an error');
                } else if (axiosError.request) {
                    // The request was made but no response was received
                    console.error('No response received. Request details:', axiosError.request);
                    throw new Error('Network error - no response from server. Please check your connection and try again.');
                } else {
                    // Something happened in setting up the request that triggered an Error
                    console.error('Error during request setup:', axiosError.message);
                    throw new Error(`Error setting up request: ${axiosError.message}`);
                }
            }
        } catch (err) {
            console.error('Login error:', err);
            const message = err.message || 'An unexpected error occurred';
            setError(message);
            setLoading(false);
            return false; // Indicate failure
        }
    };

    // --- Register Function ---
    const register = async (name, email, password, role) => {
        setLoading(true);
        setError(null);
        try {
            console.log('Registering new user:', email);
            const { data } = await api.post(
                '/users/register',
                { name, email, password, role }
            );

            setUserInfo(data); // Login user immediately after registration
            localStorage.setItem('userInfo', JSON.stringify(data));
            setLoading(false);
            return true; // Indicate success
        } catch (err) {
            const message =
                err.response && err.response.data.message
                    ? err.response.data.message
                    : err.message;
            setError(message);
            setLoading(false);
            return false; // Indicate failure
        }
    };

    // --- Logout Function ---
    const logout = () => {
        localStorage.removeItem('userInfo');
        setUserInfo(null);
        // Optionally redirect here or let components handle redirect
    };    // --- Firebase Auth Function ---
    const loginWithFirebase = async (firebaseToken, role) => {
        setLoading(true);
        setError(null);
        try {
            console.log('Authenticating with Firebase token');
            const { data } = await api.post(
                '/users/firebase-auth', // Your backend endpoint
                { firebaseToken, role }
            );
            setUserInfo(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            setLoading(false);
            return true;
        } catch (err) {
            const message =
                err.response && err.response.data.message
                    ? err.response.data.message
                    : err.message;
            setError(message);
            setLoading(false);
            return false;
        }
    };    // --- Get User Profile ---
    const getUserProfile = async () => {
        setLoading(true);
        setError(null);
        try {
            // Check if user is authenticated
            if (!userInfo || !userInfo.token) {
                console.error("User not authenticated: No userInfo or token");
                setError("Please log in to view your profile.");
                setLoading(false);
                return null;
            }
            
            console.log("Making request to /users/profile with token");
            
            // Authorization header is added automatically by the api interceptor
            // Make API call to get profile data
            const { data } = await api.get('/users/profile');
            console.log("Profile data retrieved successfully");
            setLoading(false);
            return data;
        } catch (err) {
            console.error("Error in getUserProfile:", err);
            
            // Handle expired token or authentication issues
            if (err.response && err.response.status === 401) {
                // Token might be expired - log user out
                console.log("Token expired or invalid. Logging out user.");
                localStorage.removeItem('userInfo');
                setUserInfo(null);
                setError("Your session has expired. Please log in again.");
            } else if (err.response && err.response.status === 404) {
                setError("User profile not found. Please check your account.");
            } else if (err.response && err.response.data.message) {
                setError(err.response.data.message);
            } else if (err.message) {
                setError(err.message);
            } else {
                setError("Failed to load profile. Please try again later.");
            }
            
            setLoading(false);
            return null;
        }
    };// --- Update User Profile ---
    const updateUserProfile = async (profileData) => {
        setLoading(true);
        setError(null);
        try {
            console.log('Updating user profile');
            
            // Authorization header is added automatically by the api interceptor
            const { data } = await api.put('/users/profile', profileData);
            
            // Update the stored user info with new data
            setUserInfo(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            
            setLoading(false);
            return { success: true, data };
        } catch (err) {
            const message = 
                err.response && err.response.data.message
                    ? err.response.data.message
                    : err.message;
            setError(message);
            setLoading(false);
            return { success: false, message };
        }
    };    // --- Get Public User Profile ---
    const getPublicUserProfile = async (userId) => {
        setLoading(true);
        setError(null);
        try {
            console.log(`Fetching public profile for user ID: ${userId}`);
            const { data } = await api.get(`/users/${userId}`);
            console.log(`Public profile data retrieved successfully for user ID: ${userId}`);
            setLoading(false);
            return data;
        } catch (err) {
            console.error(`Error fetching public profile:`, err);
            
            if (err.response && err.response.status === 404) {
                setError("User not found. The profile may have been deleted or is unavailable.");
            } else if (err.response && err.response.data.message) {
                setError(err.response.data.message);
            } else if (err.message) {
                setError(err.message);
            } else {
                setError("Failed to load profile. Please try again later.");
            }
            
            setLoading(false);
            return null;
        }
    };

    // --- Define isAuthenticated ---
    const isAuthenticated = !!userInfo; // Converts userInfo to a boolean (true if userInfo exists, false otherwise)    // --- Value Provided by Context ---
    const value = {
        userInfo,
        loading, // expose loading state
        error,   // expose error state
        login,
        logout,
        register,
        loginWithFirebase,
        getUserProfile,
        updateUserProfile,
        getPublicUserProfile,
        setError,         // expose function to clear errors
        isLoading: loading,
        isAuthenticated   // Use the defined isAuthenticated
    };

    // Render children wrapped by the provider, passing the value
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// --- Custom Hook to Consume Context ---
// This is what components import to use the context values
export const useAuth = () => {
    return useContext(AuthContext);
};

// --- Export Context (Optional, mainly for structure) ---
export default AuthContext;