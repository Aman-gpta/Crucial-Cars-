// frontend/src/services/carService.js
import api from './api'; // Import the configured Axios instance

/**
 * Fetches available car listings from the backend.
 * Optionally takes query parameters for searching/filtering.
 * @param {object} [params={}] - Optional query parameters (e.g., { keyword: 'search term' }).
 * @returns {Promise<Array>} - A promise that resolves to an array of car objects.
 */
export const fetchCars = async (params = {}) => { // Renamed for consistency
    try {
        const { data } = await api.get('/api/cars', { params });
        return data;
    } catch (error) {
        console.error("Error fetching cars:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Fetches details for a single car by its ID.
 * @param {string} id - The ID of the car to fetch.
 * @returns {Promise<object>} - A promise that resolves to the car object.
 */
export const fetchCarById = async (id) => { // Added this function
    if (!id) throw new Error("Car ID is required.");
    try {
        const { data } = await api.get(`/api/cars/${id}`);
        return data;
    } catch (error) {
        console.error(`Error fetching car with ID ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Deletes a car listing by ID.
 * @param {string} id - The ID of the car to delete.
 * @returns {Promise<object>} - A promise that resolves to the response data.
 */
export const deleteCar = async (id) => {
    if (!id) throw new Error("Car ID is required.");    try {
        const { data } = await api.delete(`/api/cars/${id}`);
        return data;
    } catch (error) {
        console.error(`Error deleting car with ID ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

// Add other car-related API functions here later (create, update, delete)
// export const createCarListing = async (carData) => { ... };
// export const updateCarListing = async (id, carData) => { ... };
// export const deleteCarListing = async (id) => { ... };
// export const requestTestDrive = async (requestData) => { ... };

/**
 * Fetches all cars owned by the logged-in user.
 * @returns {Promise<Array>} - A promise that resolves to an array of car objects.
 */
export const fetchCarsByOwner = async () => {
    try {
        const { data } = await api.get('/api/cars/my-listings/owner');
        return data;
    } catch (error) {
        console.error("Error fetching owner's cars:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Toggles the availability status of a car.
 * @param {string} id - The ID of the car to update.
 * @param {boolean} isAvailable - The new availability status.
 * @returns {Promise<object>} - A promise that resolves to the updated car object.
 */
export const updateCarAvailability = async (id, isAvailable) => {
    if (!id) throw new Error("Car ID is required.");
    try {
        const { data } = await api.patch(`/api/cars/${id}/toggle-availability`);
        return data;
    } catch (error) {
        console.error(`Error updating car availability:`, error.response?.data || error.message);
        throw error;
    }
};