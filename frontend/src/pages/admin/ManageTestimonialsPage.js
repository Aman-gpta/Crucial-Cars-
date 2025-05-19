// frontend/src/pages/admin/ManageTestimonialsPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    fetchTestimonials,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial
} from '../../services/testimonialService';
import { useAuth } from '../../context/AuthContext';

const ManageTestimonialsPage = () => {
    const navigate = useNavigate();
    const { userInfo } = useAuth();

    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Form state for adding/editing testimonials
    const [isEditing, setIsEditing] = useState(false);
    const [currentTestimonial, setCurrentTestimonial] = useState({
        name: '',
        role: '',
        image: '',
        text: ''
    });

    // Load testimonials on component mount
    useEffect(() => {
        // Check if user is admin
        if (!userInfo || userInfo.role !== 'Admin') {
            navigate('/login');
            return;
        }

        loadTestimonials();
    }, [userInfo, navigate]);

    const loadTestimonials = async () => {
        try {
            setLoading(true);
            const data = await fetchTestimonials();
            setTestimonials(data);
            setError('');
        } catch (err) {
            setError('Failed to load testimonials. Please try again.');
            console.error('Error loading testimonials:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentTestimonial({
            ...currentTestimonial,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            if (isEditing) {
                await updateTestimonial(currentTestimonial._id, currentTestimonial);
            } else {
                await createTestimonial(currentTestimonial);
            }

            // Reset form and reload testimonials
            setCurrentTestimonial({
                name: '',
                role: '',
                image: '',
                text: ''
            });
            setIsEditing(false);
            await loadTestimonials();
        } catch (err) {
            setError('Failed to save testimonial. Please try again.');
            console.error('Error saving testimonial:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (testimonial) => {
        setCurrentTestimonial(testimonial);
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this testimonial?')) {
            try {
                setLoading(true);
                await deleteTestimonial(id);
                await loadTestimonials();
            } catch (err) {
                setError('Failed to delete testimonial. Please try again.');
                console.error('Error deleting testimonial:', err);
            } finally {
                setLoading(false);
            }
        }
    };

    const cancelEdit = () => {
        setCurrentTestimonial({
            name: '',
            role: '',
            image: '',
            text: ''
        });
        setIsEditing(false);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Manage Testimonials</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Add/Edit Testimonial Form */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">
                    {isEditing ? 'Edit Testimonial' : 'Add New Testimonial'}
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-gray-700 mb-2">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={currentTestimonial.name}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2">Role</label>
                            <input
                                type="text"
                                name="role"
                                value={currentTestimonial.role}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Image URL</label>
                        <input
                            type="url"
                            name="image"
                            value={currentTestimonial.image}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="https://example.com/image.jpg"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2">Testimonial Text</label>
                        <textarea
                            name="text"
                            value={currentTestimonial.text}
                            onChange={handleInputChange}
                            rows="4"
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        ></textarea>
                    </div>

                    <div className="flex justify-end space-x-3">
                        {isEditing && (
                            <button
                                type="button"
                                onClick={cancelEdit}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : (isEditing ? 'Update Testimonial' : 'Add Testimonial')}
                        </button>
                    </div>
                </form>
            </div>

            {/* Testimonials List */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Existing Testimonials</h2>

                {loading && !testimonials.length ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                    </div>
                ) : !testimonials.length ? (
                    <p className="text-gray-500 py-4">No testimonials found. Add your first one above.</p>
                ) : (
                    <div className="space-y-6">
                        {testimonials.map(testimonial => (
                            <div key={testimonial._id} className="border-b pb-4 last:border-b-0">
                                <div className="flex flex-col md:flex-row md:items-center">
                                    <div className="flex items-center mb-3 md:mb-0 md:mr-6">
                                        <img
                                            src={testimonial.image}
                                            alt={testimonial.name}
                                            className="w-10 h-10 rounded-full mr-3 object-cover"
                                        />
                                        <div>
                                            <h3 className="font-medium">{testimonial.name}</h3>
                                            <p className="text-sm text-gray-600">{testimonial.role}</p>
                                        </div>
                                    </div>
                                    <div className="md:flex-grow">
                                        <p className="text-gray-700 italic">"{testimonial.text}"</p>
                                    </div>
                                    <div className="flex mt-3 md:mt-0">
                                        <button
                                            onClick={() => handleEdit(testimonial)}
                                            className="text-indigo-600 hover:text-indigo-800 mr-4"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(testimonial._id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageTestimonialsPage;
