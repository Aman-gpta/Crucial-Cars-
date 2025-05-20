// frontend/src/services/api.js
import axios from 'axios';

// Set the API base URL directly to ensure it's used consistently
const API_BASE_URL = 'http://localhost:5000/api';

console.log('Using API base URL:', API_BASE_URL);

// Create an Axios instance with default configuration
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: false, // Changed to false to fix CORS issues
    timeout: 10000, // Set a timeout to avoid hanging requests
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
                    console.log('Adding auth token to request:', config.url);
                    config.headers['Authorization'] = `Bearer ${userInfo.token}`;
                    console.log(`Token (first 15 chars): ${userInfo.token.substring(0, 15)}...`);
                } else {
                    console.warn('User info found but no token available:', userInfo);
                }
            } catch (e) {
                console.error("Error parsing user info for interceptor:", e);
                // Clear invalid storage item to prevent persistent issues
                localStorage.removeItem('userInfo');
            }
        } else {
            console.warn('No user info found in localStorage for request:', config.url);
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
        console.log(`API Response success [${response.config.method.toUpperCase()} ${response.config.url}]: Status ${response.status}`);
        return response;
    },
    (error) => {
        // Handle errors (status codes outside 2xx)
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error(`API Response error [${error.config?.method?.toUpperCase()} ${error.config?.url}]: Status ${error.response.status}`, error.response.data);
            
            // Example: Handle expired token / unauthorized access globally
            if (error.response.status === 401) {
                console.log("Unauthorized (401). Possible expired token. Logging out.");
                // Remove user info from storage
                localStorage.removeItem('userInfo');
                // Force a reload to the login page (or use state management/router)
                // This simplistic approach might lose state, better integration with AuthContext is possible
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
        } else if (error.request) {
            // The request was made but no response was received
            console.error(`API Network error [${error.config?.method?.toUpperCase()} ${error.config?.url}]: No response received`, error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error(`API Request setup error [${error.config?.url}]:`, error.message);
        }

        // Important: Re-reject the error so components calling the API can also handle it
        return Promise.reject(error);
    }
);


// Export the configured Axios instance to be used by service files
export default api;