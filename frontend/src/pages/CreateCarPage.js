// frontend/src/pages/CreateCarPage.js
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const CreateCarPage = () => {
    // Navigation hook for redirecting after form submission
    const navigate = useNavigate();

    // Get authentication context for user info
    const { userInfo } = useAuth();

    // Reference to the file input element
    const fileInputRef = useRef(null);

    // State for form inputs
    const [formData, setFormData] = useState({
        make: '',
        model: '',
        year: '',
        color: '',
        price: '',
        mileage: '',
        transmission: 'Automatic',
        fuelType: 'Petrol',
        description: '',
        location: ''
    });

    // State for the image file
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // State for form submission
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Handle image file selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);

            // Create a preview URL for the selected image
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!imageFile) {
            setError('Please select an image for your car');
            setLoading(false);
            return;
        }

        try {
            // Create FormData object to handle file upload
            const carFormData = new FormData();

            // Add all form fields to FormData
            Object.keys(formData).forEach(key => {
                carFormData.append(key, formData[key]);
            });

            // Add the image file
            carFormData.append('image', imageFile);

            // Get token from userInfo
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data', // Important for file uploads
                    Authorization: `Bearer ${userInfo.token}`
                }
            };

            // Send request to backend
            await axios.post('/api/cars', carFormData, config);

            setSuccess('Car successfully added!');

            // Redirect to my cars page or home page after a delay
            setTimeout(() => {
                navigate('/');  // or '/my-cars' if you have a dedicated page
            }, 2000);

        } catch (err) {
            const message = err.response && err.response.data.message
                ? err.response.data.message
                : 'Failed to add car. Please try again.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
                Add Your Car
            </h1>

            {/* Success Message */}
            {success && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                    {success}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Make */}
                    <div>
                        <label htmlFor="make" className="block text-sm font-medium text-gray-700">
                            Make *
                        </label>
                        <input
                            type="text"
                            id="make"
                            name="make"
                            value={formData.make}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="e.g. Toyota, BMW, Ford"
                        />
                    </div>

                    {/* Model */}
                    <div>
                        <label htmlFor="model" className="block text-sm font-medium text-gray-700">
                            Model *
                        </label>
                        <input
                            type="text"
                            id="model"
                            name="model"
                            value={formData.model}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="e.g. Corolla, 3 Series, Mustang"
                        />
                    </div>

                    {/* Year */}
                    <div>
                        <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                            Year *
                        </label>
                        <input
                            type="number"
                            id="year"
                            name="year"
                            value={formData.year}
                            onChange={handleChange}
                            required
                            min="1900"
                            max={new Date().getFullYear() + 1}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="e.g. 2022"
                        />
                    </div>

                    {/* Color */}
                    <div>
                        <label htmlFor="color" className="block text-sm font-medium text-gray-700">
                            Color *
                        </label>
                        <input
                            type="text"
                            id="color"
                            name="color"
                            value={formData.color}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="e.g. Black, Silver, Red"
                        />
                    </div>

                    {/* Price */}
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                            Price (per day) *
                        </label>
                        <div className="relative mt-1 rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-500 sm:text-sm">₹</span>
                            </div>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.01"
                                className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {/* Mileage */}
                    <div>
                        <label htmlFor="mileage" className="block text-sm font-medium text-gray-700">
                            Mileage *
                        </label>
                        <div className="relative mt-1 rounded-md shadow-sm">
                            <input
                                type="number"
                                id="mileage"
                                name="mileage"
                                value={formData.mileage}
                                onChange={handleChange}
                                required
                                min="0"
                                className="block w-full rounded-md border-gray-300 pr-12 focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="e.g. 25000"
                            />
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                <span className="text-gray-500 sm:text-sm">miles</span>
                            </div>
                        </div>
                    </div>

                    {/* Transmission */}
                    <div>
                        <label htmlFor="transmission" className="block text-sm font-medium text-gray-700">
                            Transmission *
                        </label>
                        <select
                            id="transmission"
                            name="transmission"
                            value={formData.transmission}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                        >
                            <option value="Automatic">Automatic</option>
                            <option value="Manual">Manual</option>
                            <option value="Semi-Automatic">Semi-Automatic</option>
                            <option value="CVT">CVT</option>
                        </select>
                    </div>

                    {/* Fuel Type */}
                    <div>
                        <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700">
                            Fuel Type *
                        </label>
                        <select
                            id="fuelType"
                            name="fuelType"
                            value={formData.fuelType}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                        >
                            <option value="Petrol">Petrol</option>
                            <option value="Diesel">Diesel</option>
                            <option value="Electric">Electric</option>
                            <option value="Hybrid">Hybrid</option>
                            <option value="Plug-in Hybrid">Plug-in Hybrid</option>
                            <option value="LPG">LPG</option>
                        </select>
                    </div>

                    {/* Location */}
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                            Location *
                        </label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="e.g. New York, NY"
                        />
                    </div>

                    {/* Car Image Upload */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Car Image *
                        </label>

                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                {imagePreview ? (
                                    <div>
                                        <img
                                            src={imagePreview}
                                            alt="Car preview"
                                            className="mx-auto h-40 w-auto object-cover rounded"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImageFile(null);
                                                setImagePreview(null);
                                                if (fileInputRef.current) {
                                                    fileInputRef.current.value = '';
                                                }
                                            }}
                                            className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <svg
                                            className="mx-auto h-12 w-12 text-gray-400"
                                            stroke="currentColor"
                                            fill="none"
                                            viewBox="0 0 48 48"
                                            aria-hidden="true"
                                        >
                                            <path
                                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                strokeWidth={2}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        <p className="text-xs text-gray-500">
                                            PNG, JPG, JPEG up to 5MB
                                        </p>
                                    </div>
                                )}

                                <div className="flex text-sm text-gray-600 justify-center">
                                    <label
                                        htmlFor="image-upload"
                                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                    >
                                        <span>{imagePreview ? 'Change image' : 'Upload an image'}</span>
                                        <input
                                            id="image-upload"
                                            name="image-upload"
                                            type="file"
                                            ref={fileInputRef}
                                            className="sr-only"
                                            accept="image/png, image/jpeg, image/jpg"
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description *
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows={4}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Provide details about your car's features, condition, and any special notes..."
                    ></textarea>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Adding Car...' : 'Add Car'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateCarPage;