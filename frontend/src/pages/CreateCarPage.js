// frontend/src/pages/CreateCarPage.js
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createCar } from '../services/carService';

const CreateCarPage = () => {    // Navigation hook for redirecting after form submission
    const navigate = useNavigate();

    // Get authentication context for user info
    // eslint-disable-next-line no-unused-vars
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
    });    // State for the image files
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

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
    };    // Handle image file selection
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setImageFiles(files);

            // Create preview URLs for the selected images
            const previews = files.map(file => URL.createObjectURL(file));
            setImagePreviews(previews);
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (imageFiles.length === 0) {
            setError('Please select at least one image for your car');
            setLoading(false);
            return;
        }

        try {            // Create FormData object to handle file upload
            const carFormData = new FormData();

            // Add all form fields to FormData
            Object.keys(formData).forEach(key => {
                carFormData.append(key, formData[key]);
            });
            
            // Add all image files with the field name 'images'
            imageFiles.forEach(file => {
                carFormData.append('images', file);
            });
            
            // Send request to backend using carService
            await createCar(carFormData);

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
    };    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-purple-gradient mb-8">
                Add Your Car
            </h1>

            {/* Success Message */}
            {success && (
                <div className="mb-4 p-4 bg-green-900 bg-opacity-30 border border-green-700 text-green-400 rounded animate-fadeIn">
                    {success}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-4 bg-red-900 bg-opacity-30 border border-red-700 text-red-400 rounded animate-fadeIn">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 bg-theme-black-900 bg-opacity-80 p-6 rounded-lg shadow-purple-glow border border-theme-purple-700 backdrop-blur-sm animate-fadeIn">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Make */}
                    <div>
                        <label htmlFor="make" className="block text-sm font-medium text-theme-purple-300">
                            Make *
                        </label>
                        <input
                            type="text"
                            id="make"
                            name="make"
                            value={formData.make}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md bg-theme-black-800 border-theme-purple-600 text-white shadow-sm focus:border-theme-purple-500 focus:ring-theme-purple-500"
                            placeholder="e.g. Toyota, BMW, Ford"
                        />
                    </div>

                    {/* Model */}
                    <div>
                        <label htmlFor="model" className="block text-sm font-medium text-theme-purple-300">
                            Model *
                        </label>
                        <input
                            type="text"
                            id="model"
                            name="model"
                            value={formData.model}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md bg-theme-black-800 border-theme-purple-600 text-white shadow-sm focus:border-theme-purple-500 focus:ring-theme-purple-500"
                            placeholder="e.g. Corolla, 3 Series, Mustang"
                        />
                    </div>

                    {/* Year */}
                    <div>
                        <label htmlFor="year" className="block text-sm font-medium text-theme-purple-300">
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
                            className="mt-1 block w-full rounded-md bg-theme-black-800 border-theme-purple-600 text-white shadow-sm focus:border-theme-purple-500 focus:ring-theme-purple-500"
                            placeholder="e.g. 2022"
                        />
                    </div>

                    {/* Color */}
                    <div>
                        <label htmlFor="color" className="block text-sm font-medium text-theme-purple-300">
                            Color *
                        </label>
                        <input
                            type="text"
                            id="color"
                            name="color"
                            value={formData.color}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md bg-theme-black-800 border-theme-purple-600 text-white shadow-sm focus:border-theme-purple-500 focus:ring-theme-purple-500"
                            placeholder="e.g. Black, Silver, Red"
                        />
                    </div>

                    {/* Price */}
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-theme-purple-300">
                            Price (per day) *
                        </label>
                        <div className="relative mt-1 rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-theme-purple-400 sm:text-sm">₹</span>
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
                                className="block w-full rounded-md bg-theme-black-800 border-theme-purple-600 text-white pl-7 pr-12 focus:border-theme-purple-500 focus:ring-theme-purple-500"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {/* Mileage */}
                    <div>
                        <label htmlFor="mileage" className="block text-sm font-medium text-theme-purple-300">
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
                                className="block w-full rounded-md bg-theme-black-800 border-theme-purple-600 text-white pr-12 focus:border-theme-purple-500 focus:ring-theme-purple-500"
                                placeholder="e.g. 25000"
                            />
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                <span className="text-theme-purple-400 sm:text-sm">miles</span>
                            </div>
                        </div>
                    </div>

                    {/* Transmission */}
                    <div>
                        <label htmlFor="transmission" className="block text-sm font-medium text-theme-purple-300">
                            Transmission *
                        </label>
                        <select
                            id="transmission"
                            name="transmission"
                            value={formData.transmission}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md bg-theme-black-800 border-theme-purple-600 text-white py-2 px-3 shadow-sm focus:border-theme-purple-500 focus:outline-none focus:ring-theme-purple-500"
                        >
                            <option value="Automatic">Automatic</option>
                            <option value="Manual">Manual</option>
                            <option value="Semi-Automatic">Semi-Automatic</option>
                            <option value="CVT">CVT</option>
                        </select>
                    </div>

                    {/* Fuel Type */}
                    <div>
                        <label htmlFor="fuelType" className="block text-sm font-medium text-theme-purple-300">
                            Fuel Type *
                        </label>
                        <select
                            id="fuelType"
                            name="fuelType"
                            value={formData.fuelType}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md bg-theme-black-800 border-theme-purple-600 text-white py-2 px-3 shadow-sm focus:border-theme-purple-500 focus:outline-none focus:ring-theme-purple-500"
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
                        <label htmlFor="location" className="block text-sm font-medium text-theme-purple-300">
                            Location *
                        </label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md bg-theme-black-800 border-theme-purple-600 text-white shadow-sm focus:border-theme-purple-500 focus:ring-theme-purple-500"
                            placeholder="e.g. New York, NY"
                        />
                    </div>                    {/* Car Images Upload */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-theme-purple-300 mb-2">
                            Car Images * (Up to 5)
                        </label>

                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-theme-purple-600 rounded-md bg-theme-black-800 bg-opacity-50">
                            <div className="space-y-1 text-center w-full">
                                {imagePreviews.length > 0 ? (
                                    <div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {imagePreviews.map((preview, index) => (
                                                <div key={index} className="relative">
                                                    <img
                                                        src={preview}
                                                        alt={`Car preview ${index + 1}`}
                                                        className="h-32 w-full object-cover rounded border border-theme-purple-500 shadow-purple-glow"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newPreviews = [...imagePreviews];
                                                            const newFiles = [...imageFiles];
                                                            newPreviews.splice(index, 1);
                                                            newFiles.splice(index, 1);
                                                            setImagePreviews(newPreviews);
                                                            setImageFiles(newFiles);
                                                        }}
                                                        className="absolute top-1 right-1 bg-red-700 text-white rounded-full p-1 hover:bg-red-800 transition-colors"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        {imagePreviews.length < 5 && (
                                            <div className="mt-4">
                                                <label
                                                    htmlFor="image-upload"
                                                    className="cursor-pointer bg-theme-black-700 rounded-md font-medium text-theme-purple-400 hover:text-theme-purple-300 px-4 py-2 border border-theme-purple-600 hover:border-theme-purple-500 transition-colors duration-300"
                                                >
                                                    <span>Add more images</span>
                                                    <input
                                                        id="image-upload"
                                                        name="image-upload"
                                                        type="file"
                                                        ref={fileInputRef}
                                                        className="sr-only"
                                                        accept="image/png, image/jpeg, image/jpg"
                                                        onChange={handleImageChange}
                                                        multiple
                                                    />
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <svg
                                            className="mx-auto h-12 w-12 text-theme-purple-400"
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
                                        <p className="text-xs text-theme-purple-400 mt-2">
                                            PNG, JPG, JPEG up to 5MB (Select up to 5 images)
                                        </p>
                                        <div className="flex justify-center mt-4">
                                            <label
                                                htmlFor="image-upload"
                                                className="cursor-pointer bg-theme-black-700 rounded-md font-medium text-theme-purple-400 hover:text-theme-purple-300 px-4 py-2 border border-theme-purple-600 hover:border-theme-purple-500 transition-colors duration-300"
                                            >
                                                <span>Upload images</span>
                                                <input
                                                    id="image-upload"
                                                    name="image-upload"
                                                    type="file"
                                                    ref={fileInputRef}
                                                    className="sr-only"
                                                    accept="image/png, image/jpeg, image/jpg"
                                                    onChange={handleImageChange}
                                                    multiple
                                                />
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-theme-purple-300">
                        Description *
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows={4}
                        className="mt-1 block w-full rounded-md bg-theme-black-800 border-theme-purple-600 text-white shadow-sm focus:border-theme-purple-500 focus:ring-theme-purple-500"
                        placeholder="Provide details about your car's features, condition, and any special notes..."
                    ></textarea>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`gradient-button text-white font-medium py-3 px-6 rounded-md transition duration-300 shadow-purple-glow transform hover:scale-105 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Adding Car...' : 'Add Car'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateCarPage;