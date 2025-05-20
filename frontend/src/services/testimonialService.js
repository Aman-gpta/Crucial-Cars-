// frontend/src/services/testimonialService.js
import api from './api'; // Import the configured Axios instance

/**
 * Fetches testimonials from the backend.
 * @returns {Promise<Array>} - A promise that resolves to an array of testimonial objects.
 */
export const fetchTestimonials = async () => {
    try {
        console.log('Fetching testimonials from endpoint');
        const { data } = await api.get('/testimonials');
        console.log('Testimonials data received:', data);
        return data;
    } catch (error) {
        console.error("Error fetching testimonials:", error);
        // Return default testimonials instead of throwing
        return [
            {
                _id: '1',
                name: "Ananya Verma",
                role: "Automobile Journalist",
                image: "https://randomuser.me/api/portraits/women/45.jpg",
                text: "CrucialCars helped me find the perfect car for my latest article. The process was seamless, and the car owner was very accommodating!"
            },
            {
                _id: '2',
                name: "Rohan Mehta",
                role: "Car Enthusiast",
                image: "https://randomuser.me/api/portraits/men/50.jpg",
                text: "As a car owner, I love sharing my vehicle with influencers. CrucialCars makes it easy to connect and earn extra income."
            },
            {
                _id: '3',
                name: "Priya Singh",
                role: "Travel Blogger",
                image: "https://randomuser.me/api/portraits/women/33.jpg",
                text: "I used CrucialCars to find unique vehicles for my road trip series. The variety of cars available was impressive, and the owners were fantastic!"
            }
        ];
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
        const { data } = await api.get(`/testimonials/${id}`);
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
        const { data } = await api.post('/testimonials', testimonialData);
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
        const { data } = await api.put(`/testimonials/${id}`, testimonialData);
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
        const { data } = await api.delete(`/testimonials/${id}`);
        return data;
    } catch (error) {
        console.error(`Error deleting testimonial with ID ${id}:`, error.response?.data || error.message);
        throw error;
    }
};
