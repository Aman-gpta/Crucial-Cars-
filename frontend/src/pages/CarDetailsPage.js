// frontend/src/pages/CarDetailsPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchCarById } from '../services/carService'; 
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// Basic placeholder image URL
const placeholderImage = 'https://via.placeholder.com/600x400.png?text=No+Image';

const CarDetailsPage = () => {
    const { id: carId } = useParams();
    const { userInfo } = useAuth();
    const navigate = useNavigate();

    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentImage, setCurrentImage] = useState(null); // State for the current displayed image
    const [galleryImages, setGalleryImages] = useState([]); // State for processed gallery images

    // States for handling test drive request
    const [requestLoading, setRequestLoading] = useState(false);
    const [requestError, setRequestError] = useState('');
    const [requestSuccess, setRequestSuccess] = useState('');

    // Helper function to process image URLs
    const processImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return imagePath.startsWith('/uploads/') ? imagePath : `/uploads/${imagePath}`;
    };

    useEffect(() => {
        const loadCarDetails = async () => {
            setLoading(true);
            setError('');
            setCar(null);
            setRequestError('');
            setRequestSuccess('');
            setCurrentImage(null);
            setGalleryImages([]);
            
            try {
                const data = await fetchCarById(carId);
                setCar(data);
                
                // Process main image
                let mainImage = null;
                if (data.image) {
                    mainImage = processImageUrl(data.image);
                }
                
                // Process gallery images
                let images = [];
                // Include main image in gallery if it exists
                if (mainImage) {
                    images.push(mainImage);
                }
                
                // Add images from the images array, if they exist
                if (data.images && data.images.length > 0) {
                    // Filter out duplicates and process paths
                    const additionalImages = data.images
                        .map(img => processImageUrl(img))
                        .filter(img => img && img !== mainImage); // Remove nulls and duplicates
                    
                    images = [...images, ...additionalImages];
                }
                
                // Set current image and gallery
                if (images.length > 0) {
                    setCurrentImage(images[0]);
                    setGalleryImages(images);
                } else {
                    setCurrentImage(placeholderImage);
                    setGalleryImages([]);
                }
            } catch (err) {
                if (err.response && err.response.status === 404) {
                    setError(`Car with ID ${carId} not found.`);
                } else {
                    setError('Failed to load car details. Please try again later.');
                }
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadCarDetails();
    }, [carId]);

    // --- Handler for Test Drive Request Button ---
    const handleTestDriveRequest = async () => {
        if (!userInfo || userInfo.role !== 'Journalist') {
            setRequestError("Only logged-in Journalists can request a test drive.");
            return;
        }
        setRequestLoading(true);
        setRequestError('');
        setRequestSuccess('');        try {
            await api.post('/api/requests', { carId });
            setRequestSuccess("Test drive requested successfully! Check your dashboard for status updates.");
        } catch (err) {
            setRequestError(err.response?.data?.message || "Failed to request test drive. You may have already requested this car.");
            console.error("Test drive request error:", err);
        } finally {
            setRequestLoading(false);
        }
    };

    // Handler to change the main displayed image
    const handleImageClick = (image) => {
        setCurrentImage(image);
    };

    // --- Render Logic ---
    if (loading) {
        return <div className="text-center py-10"><p>Loading car details...</p></div>;
    }

    if (error) {
        return (
            <div className="text-center py-10 px-4 bg-red-100 text-red-700 border border-red-300 rounded-md">
                <p className="font-semibold">Error:</p>
                <p>{error}</p>
                <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">Go back to listings</Link>
            </div>
        );
    }

    if (!car) {
        return <div className="text-center py-10">Car not found.</div>;
    }

    // Determine if the request button should be shown
    const canRequestTestDrive = userInfo?.role === 'Journalist' && car.isAvailable && userInfo?._id !== car.owner?._id;

    return (
        <div className="bg-white rounded-lg shadow-xl overflow-hidden p-6 md:p-8 lg:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image Section */}
                <div>
                    <div className="relative overflow-hidden rounded-lg shadow-md mb-4 bg-gray-100">
                        <img
                            src={currentImage}
                            alt={`${car.make} ${car.model}`}
                            className="w-full h-auto object-cover max-h-96"
                            onError={(e) => { e.target.onerror = null; e.target.src = placeholderImage }}
                        />
                    </div>
                    
                    {/* Image gallery */}
                    {galleryImages.length > 0 && (
                        <div className="flex space-x-2 overflow-x-auto pb-2">
                            {galleryImages.map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    alt={`${car.make} ${car.model} - View ${index + 1}`}
                                    className={`h-16 w-auto rounded cursor-pointer transition-all duration-200 
                                               ${currentImage === img 
                                                   ? 'opacity-100 border-2 border-blue-500' 
                                                   : 'opacity-75 hover:opacity-100 border border-transparent hover:border-indigo-500'}`}
                                    onClick={() => handleImageClick(img)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Details Section */}
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                        {car.year} {car.make} {car.model}
                    </h1>
                    <p className="text-lg text-gray-500 mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {car.location}
                    </p>

                    <div className="mb-6 border-t pt-4">
                        <h3 className="text-xl font-semibold text-gray-700 mb-3">Description</h3>
                        <p className="text-gray-600 whitespace-pre-wrap">{car.description}</p>
                    </div>

                    <div className="mb-6 border-t pt-4">
                        <h3 className="text-xl font-semibold text-gray-700 mb-3">Owner Information</h3>
                        {car.owner ? (
                            <p className="text-gray-600">Listed by: {car.owner.name} ({car.owner.email})</p>
                        ) : (
                            <p className="text-gray-500 italic">Owner information not available.</p>
                        )}
                    </div>

                    <div className="mb-6 border-t pt-4">
                        <h3 className="text-xl font-semibold text-gray-700 mb-3">Availability</h3>
                        <p className={`text-lg font-medium ${car.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                            {car.isAvailable ? 'Available for Test Drive' : 'Currently Unavailable'}
                        </p>
                    </div>

                    {/* Test Drive Request Button Area */}
                    {canRequestTestDrive && (
                        <div className="border-t pt-6">
                            <button
                                onClick={handleTestDriveRequest}
                                disabled={requestLoading || !!requestSuccess}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                            >
                                {requestLoading ? 'Requesting...' : (requestSuccess ? 'Request Sent!' : 'Request Test Drive')}
                            </button>
                            {requestError && <p className="text-sm text-red-600 text-center mt-2">{requestError}</p>}
                            {requestSuccess && <p className="text-sm text-green-600 text-center mt-2">{requestSuccess}</p>}
                        </div>
                    )}
                    {!car.isAvailable && userInfo?.role === 'Journalist' && (
                        <p className="text-sm text-orange-600 text-center mt-4 border-t pt-4">This car is currently marked as unavailable by the owner.</p>
                    )}
                    {userInfo?.role === 'Car Owner' && userInfo?._id === car.owner?._id && (
                        <p className="text-sm text-blue-600 text-center mt-4 border-t pt-4">This is your car listing.</p>
                    )}
                    
                    {/* Link back to all cars */}
                    <div className="mt-6 text-center border-t pt-4">
                        <Link to="/" className="text-indigo-600 hover:text-indigo-800 transition duration-150 ease-in-out">
                            ← Back to Listings
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CarDetailsPage;