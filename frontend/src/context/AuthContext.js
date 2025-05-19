import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios'; // We'll use axios for API calls

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
    }, []); // Empty dependency array means run only once on mount

    // --- Login Function ---
    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {            const config = { headers: { 'Content-Type': 'application/json' } };
            const { data } = await axios.post(
                '/api/users/login',
                { email, password },
                config
            );

            setUserInfo(data); // Update state with user data from backend response
            localStorage.setItem('userInfo', JSON.stringify(data)); // Store in local storage
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

    // --- Register Function ---
    const register = async (name, email, password, role) => {
        setLoading(true);
        setError(null);
        try {            const config = { headers: { 'Content-Type': 'application/json' } };
            const { data } = await axios.post(
                '/api/users/register',
                { name, email, password, role },
                config
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
    };

    // --- Firebase Auth Function ---
    const loginWithFirebase = async (firebaseToken, role) => {
        setLoading(true);
        setError(null);
        try {            const config = { headers: { 'Content-Type': 'application/json' } };
            const { data } = await axios.post(
                '/api/users/firebase-auth', // Your backend endpoint
                { firebaseToken, role },
                config
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
    };

    // --- Define isAuthenticated ---
    const isAuthenticated = !!userInfo; // Converts userInfo to a boolean (true if userInfo exists, false otherwise)

    // --- Value Provided by Context ---
    const value = {
        userInfo,
        loading, // expose loading state
        error,   // expose error state
        login,
        logout,
        register,
        loginWithFirebase,
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