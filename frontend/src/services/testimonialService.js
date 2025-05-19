// frontend/src/services/testimonialService.js
import api from './api'; // Import the configured Axios instance

/**
 * Fetches testimonials from the backend.
 * @returns {Promise<Array>} - A promise that resolves to an array of testimonial objects.
 */
export const fetchTestimonials = async () => {    try {
        console.log('Fetching testimonials from:', '/api/testimonials');
        const { data } = await api.get('/api/testimonials');        console.log('Testimonials data received:', data);
        return data;
    } catch (error) {
        console.error("Error fetching testimonials:", error);
        console.error("Error details:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Fetches a single testimonial by ID.
 * @param {string} id - The ID of the testimonial.
 * @returns {Promise<object>} - A promise that resolves to the testimonial object.
 */
export const fetchTestimonialById = async (id) => {
    if (!id) throw new Error("Testimonial ID is required.");
    try {
        const { data } = await api.get(`/api/testimonials/${id}`);
        return data;
    } catch (error) {
        console.error(`Error fetching testimonial with ID ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Creates a new testimonial (Admin only).
 * @param {object} testimonialData - The testimonial data.
 * @returns {Promise<object>} - A promise that resolves to the created testimonial object.
 */
export const createTestimonial = async (testimonialData) => {
    try {
        const { data } = await api.post('/api/testimonials', testimonialData);
        return data;
    } catch (error) {
        console.error("Error creating testimonial:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Updates a testimonial (Admin only).
 * @param {string} id - The ID of the testimonial to update.
 * @param {object} testimonialData - The updated testimonial data.
 * @returns {Promise<object>} - A promise that resolves to the updated testimonial object.
 */
export const updateTestimonial = async (id, testimonialData) => {
    if (!id) throw new Error("Testimonial ID is required.");
    try {
        const { data } = await api.put(`/api/testimonials/${id}`, testimonialData);
        return data;
    } catch (error) {
        console.error(`Error updating testimonial with ID ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Deletes a testimonial (Admin only).
 * @param {string} id - The ID of the testimonial to delete.
 * @returns {Promise<object>} - A promise that resolves to the success message.
 */
export const deleteTestimonial = async (id) => {
    if (!id) throw new Error("Testimonial ID is required.");
    try {
        const { data } = await api.delete(`/api/testimonials/${id}`);
        return data;
    } catch (error) {
        console.error(`Error deleting testimonial with ID ${id}:`, error.response?.data || error.message);
        throw error;
    }
};
