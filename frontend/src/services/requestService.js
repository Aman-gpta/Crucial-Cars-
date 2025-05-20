// frontend/src/services/requestService.js
import api from './api'; // Import the configured Axios instance

/**
 * Fetches incoming test drive requests for the logged-in car owner.
 * @returns {Promise<Array>} - A promise that resolves to an array of request objects.
 */
export const fetchIncomingRequests = async () => {
    try {
        const { data } = await api.get('/requests/incoming');
        return data;
    } catch (error) {
        console.error("Error fetching incoming requests:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Fetches outgoing test drive requests for the logged-in journalist.
 * @returns {Promise<Array>} - A promise that resolves to an array of request objects.
 */
export const fetchOutgoingRequests = async () => {
    try {
        const { data } = await api.get('/requests/outgoing');
        return data;
    } catch (error) {
        console.error("Error fetching outgoing requests:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Creates a new test drive request.
 * @param {object} requestData - The request data object.
 * @param {string} requestData.carId - The ID of the car being requested.
 * @param {string} [requestData.requestedDateTime] - Optional requested date/time.
 * @param {string} [requestData.message] - Optional message to the car owner.
 * @returns {Promise<object>} - A promise that resolves to the created request object.
 */
export const createTestDriveRequest = async (requestData) => {
    console.log(`createTestDriveRequest called with data:`, requestData);
    
    // Validate carId
    if (!requestData.carId) {
        console.error('Missing carId in request data');
        throw new Error('Car ID is required');
    }
    
    try {
        console.log(`Making POST request to: /requests with data:`, requestData);
        const response = await api.post('/requests', requestData);
        
        if (!response || !response.data) {
            console.error('Empty response from server');
            throw new Error('Empty response from server');
        }
        
        console.log('createTestDriveRequest successful response:', response.data);
        return response.data;
    } catch (error) {
        console.error("Error creating test drive request:", error);
        console.error("Response data:", error.response?.data);
        console.error("Status:", error.response?.status);
        
        // Rethrow with more specific error message
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw error;
    }
};

/**
 * Updates the status of a test drive request (for car owners).
 * @param {string} requestId - The ID of the request to update.
 * @param {string} status - The new status ('Approved', 'Rejected', or 'Completed').
 * @param {string} [ownerResponse] - Optional message from the owner.
 * @returns {Promise<object>} - A promise that resolves to the updated request object.
 */
export const updateRequestStatus = async (requestId, status, ownerResponse) => {
    try {
        const { data } = await api.put(`/requests/${requestId}/status`, {
            status,
            ownerResponse
        });
        return data;
    } catch (error) {
        console.error(`Error updating request status:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Fetches details for a specific test drive request.
 * @param {string} requestId - The ID of the request to fetch.
 * @returns {Promise<object>} - A promise that resolves to the request object.
 */
export const fetchRequestById = async (requestId) => {
    try {
        const { data } = await api.get(`/requests/${requestId}`);
        return data;
    } catch (error) {
        console.error(`Error fetching request details:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Checks if the logged-in journalist already has a test drive request for a specific car.
 * @param {string} carId - The ID of the car to check.
 * @returns {Promise<object|null>} - A promise that resolves to the request object if found, null otherwise.
 */
export const checkExistingRequest = async (carId) => {
    console.log(`checkExistingRequest called with carId: ${carId}`);
    
    // Validate carId
    if (!carId) {
        console.error('Missing carId');
        throw new Error('Car ID is required');
    }
    
    try {
        console.log(`Making GET request to: /requests/check/${carId}`);
        const response = await api.get(`/requests/check/${carId}`);
        console.log('checkExistingRequest successful response:', response.data);
        
        // Validate the response data contains a request ID
        if (response.data && !response.data._id) {
            console.error('Response missing _id field:', response.data);
            throw new Error('Invalid response: missing request ID');
        }
        
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.log('No existing request found (404 response)');
            return null; // No existing request
        }
        console.error("Error checking existing request:", error);
        console.error("Response data:", error.response?.data);
        console.error("Status:", error.response?.status);
        
        // Don't throw the error, just return null for cleaner UX
        return null;
    }
};

/**
 * Withdraws (cancels) a pending test drive request.
 * @param {string} requestId - The ID of the request to withdraw.
 * @returns {Promise<object>} - A promise that resolves to the response data.
 */
export const withdrawTestDriveRequest = async (requestId) => {
    console.log(`withdrawTestDriveRequest called with requestId: ${requestId}`);
    
    // Validate requestId
    if (!requestId) {
        console.error('Missing requestId');
        throw new Error('Request ID is required');
    }
    
    try {
        console.log(`Making DELETE request to: /requests/${requestId}`);
        const response = await api.delete(`/requests/${requestId}`);
        
        if (!response || !response.data) {
            console.error('Empty response from server');
            throw new Error('Empty response from server');
        }
        
        console.log('withdrawTestDriveRequest successful response:', response.data);
        return response.data;
    } catch (error) {
        console.error("Error withdrawing test drive request:", error);
        console.error("Response data:", error.response?.data);
        console.error("Status:", error.response?.status);
        
        // Check for specific error conditions
        if (error.response?.status === 404) {
            throw new Error("Request not found or already withdrawn.");
        }
        
        // Rethrow with more specific error message
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw error;
    }
};
