// frontend/src/services/requestService.js
import api from './api'; // Import the configured Axios instance

/**
 * Fetches incoming test drive requests for the logged-in car owner.
 * @returns {Promise<Array>} - A promise that resolves to an array of request objects.
 */
export const fetchIncomingRequests = async () => {
    try {
        const { data } = await api.get('/api/requests/incoming');
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
        const { data } = await api.get('/api/requests/outgoing');
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
    try {
        const { data } = await api.post('/api/requests', requestData);
        return data;
    } catch (error) {
        console.error("Error creating test drive request:", error.response?.data || error.message);
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
        const { data } = await api.put(`/api/requests/${requestId}/status`, {
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
        const { data } = await api.get(`/api/requests/${requestId}`);
        return data;
    } catch (error) {
        console.error(`Error fetching request details:`, error.response?.data || error.message);
        throw error;
    }
};
