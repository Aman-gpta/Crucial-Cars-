// frontend/src/services/api.js
import axios from 'axios';

// Determine the base URL for the API
// Use environment variable for production, fallback for development
// The proxy in package.json handles the /api prefix in development
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

// Create an Axios instance with default configuration
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

/*
  Request Interceptor:
  This function runs BEFORE every request is sent by this Axios instance.
  It checks localStorage for user info and adds the Authorization header if a token exists.
*/
api.interceptors.request.use(
    (config) => {
        const userInfoString = localStorage.getItem('userInfo'); // Get stored user info

        if (userInfoString) {
            try {
                const userInfo = JSON.parse(userInfoString);
                // If user info and token exist, add the Authorization header
                if (userInfo && userInfo.token) {
                    config.headers['Authorization'] = `Bearer ${userInfo.token}`;
                }
            } catch (e) {
                console.error("Error parsing user info for interceptor:", e);
                // Optionally clear invalid storage item
                // localStorage.removeItem('userInfo');
            }
        }
        return config; // Return the (potentially modified) config
    },
    (error) => {
        // Handle request configuration errors
        console.error("Axios request interceptor error:", error);
        return Promise.reject(error);
    }
);

/*
  Response Interceptor (Optional but Recommended):
  This function runs whenever a response is received.
  Useful for handling global errors like 401 Unauthorized (e.g., token expired).
*/
api.interceptors.response.use(
    (response) => {
        // If response is successful (status code 2xx), just return it
        return response;
    },
    (error) => {
        // Handle errors (status codes outside 2xx)
        console.error("Axios response interceptor error:", error.response || error.message || error);

        // Example: Handle expired token / unauthorized access globally
        if (error.response && error.response.status === 401) {
            console.log("Unauthorized (401). Possible expired token. Logging out.");
            // Remove user info from storage
            localStorage.removeItem('userInfo');
            // Force a reload to the login page (or use state management/router)
            // This simplistic approach might lose state, better integration with AuthContext is possible
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }

        // Important: Re-reject the error so components calling the API can also handle it
        return Promise.reject(error);
    }
);


// Export the configured Axios instance to be used by service files
export default api;