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
        console.log('Fetching cars with params:', params);
        const { data } = await api.get('/cars', { params });
        console.log('Cars data received:', data);
        return data;
    } catch (error) {
        console.error("Error fetching cars:", error);
        // Return empty array instead of throwing to prevent app from crashing
        return [];
    }
};

/**
 * Fetches details for a single car by its ID.
 * @param {string} id - The ID of the car to fetch.
 * @returns {Promise<object>} - A promise that resolves to the car object.
 */
export const fetchCarById = async (id) => {
    if (!id) throw new Error("Car ID is required.");
    try {
        const { data } = await api.get(`/cars/${id}`);
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
    if (!id) throw new Error("Car ID is required.");
    try {
        const { data } = await api.delete(`/cars/${id}`);
        return data;
    } catch (error) {
        console.error(`Error deleting car with ID ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Fetches all cars owned by the logged-in user.
 * @returns {Promise<Array>} - A promise that resolves to an array of car objects.
 */
export const fetchCarsByOwner = async () => {
    try {
        const { data } = await api.get('/cars/my-listings/owner');
        return data;
    } catch (error) {
        console.error("Error fetching owner's cars:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Toggles the availability status of a car.
 * @param {string} id - The ID of the car to update.
 * @returns {Promise<object>} - A promise that resolves to the updated car object.
 */
export const updateCarAvailability = async (id) => {
    if (!id) throw new Error("Car ID is required.");
    try {
        const { data } = await api.patch(`/cars/${id}/toggle-availability`);
        return data;
    } catch (error) {
        console.error(`Error updating car availability:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Creates a new car listing
 * @param {FormData} carFormData - The car data as FormData (for file upload)
 * @returns {Promise<object>} - A promise that resolves to the created car object
 */
export const createCar = async (carFormData) => {
    try {
        // Set content type for file upload (handled by FormData)
        const { data } = await api.post('/cars', carFormData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return data;
    } catch (error) {
        console.error("Error creating car:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Updates an existing car
 * @param {string} id - The ID of the car to update
 * @param {object|FormData} carData - The car data to update
 * @returns {Promise<object>} - A promise that resolves to the updated car object
 */
export const updateCar = async (id, carData) => {
    if (!id) throw new Error("Car ID is required.");
    try {
        // Determine if we're dealing with FormData (image upload) or regular JSON
        const isFormData = carData instanceof FormData;
        const config = isFormData ? 
            { headers: { 'Content-Type': 'multipart/form-data' } } : 
            {};
            
        const { data } = await api.put(`/cars/${id}`, carData, config);
        return data;
    } catch (error) {
        console.error(`Error updating car:`, error.response?.data || error.message);
        throw error;
    }
};