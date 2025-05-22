// frontend/src/pages/CarDetailsPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchCarById } from '../services/carService'; 
import { checkExistingRequest, withdrawTestDriveRequest } from '../services/requestService';
import { useAuth } from '../context/AuthContext';

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
    const [existingRequest, setExistingRequest] = useState(null);    // Process image URL to handle both relative and absolute paths
    const processImageUrl = (imagePath) => {
        if (!imagePath) return placeholderImage;
        if (imagePath.startsWith('http')) return imagePath;
        
        // For backend paths that start with /uploads, prepend the backend URL
        return `http://localhost:5000${imagePath.startsWith('/uploads') ? imagePath : `/uploads/${imagePath}`}`;
    };useEffect(() => {
        const loadCarDetails = async () => {
            setLoading(true);
            setError('');
            setCar(null);
            setRequestError('');
            setRequestSuccess('');
            setCurrentImage(null);
            setGalleryImages([]);
            setExistingRequest(null);
            
            try {
                console.log(`Loading car details for car ID: ${carId}`);
                const data = await fetchCarById(carId);
                console.log('Car data received:', data);
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
                }                // Check for existing request if user is a journalist
                if (userInfo && userInfo.role === 'Journalist') {
                    console.log('User is a journalist, checking for existing requests');
                    console.log('Current user info:', userInfo);
                    try {
                        const existingReq = await checkExistingRequest(carId);
                        if (existingReq) {
                            console.log("Found existing request:", existingReq);
                            setExistingRequest(existingReq);
                        } else {
                            console.log("No existing request found");
                            setExistingRequest(null);
                        }
                    } catch (err) {
                        console.error("Error checking existing request:", err);
                        console.error("Error details:", err.response?.data);
                        // No need to show this error to the user, just continue with no existing request
                        setExistingRequest(null);
                    }
                } else {
                    console.log('User is not a journalist or not logged in:', userInfo?.role);
                    setExistingRequest(null);
                }
            } catch (err) {
                if (err.response && err.response.status === 404) {
                    setError(`Car with ID ${carId} not found.`);
                } else {
                    setError('Failed to load car details. Please try again later.');
                }
                console.error('Error loading car details:', err);
                console.error('Error details:', err.response?.data);
            } finally {
                setLoading(false);
            }
        };

        loadCarDetails();
    }, [carId, userInfo]);    // Function to refresh the existing request status
    const refreshRequestStatus = async () => {
        console.log('Refreshing request status for car:', carId);
        if (userInfo && userInfo.role === 'Journalist') {
            try {
                const existingReq = await checkExistingRequest(carId);
                if (existingReq) {
                    console.log("Found existing request:", existingReq);
                    setExistingRequest(existingReq);
                } else {
                    console.log("No existing request found");
                    setExistingRequest(null);
                }
            } catch (err) {
                console.error("Error checking existing request:", err);
                // Continue with no existing request
                setExistingRequest(null);
            }
        }
    };

    // --- Handler for Test Drive Request Button ---
    const handleTestDriveRequest = async () => {
        console.log('handleTestDriveRequest called');
        console.log('Current user:', userInfo);
        console.log('Existing request:', existingRequest);
        
        // Add debugging for auth token
        const storedUserInfo = localStorage.getItem('userInfo');
        if (storedUserInfo) {
            try {
                const parsedUserInfo = JSON.parse(storedUserInfo);
                console.log('Token in localStorage:', parsedUserInfo.token ? 'Present' : 'Missing');
                if (parsedUserInfo.token) {
                    console.log('Token first 15 chars:', parsedUserInfo.token.substring(0, 15));
                }
            } catch (e) {
                console.error('Error parsing userInfo from localStorage', e);
            }
        } else {
            console.warn('No userInfo in localStorage');
        }
        
        if (!userInfo || userInfo.role !== 'Journalist') {
            console.error('Not a journalist or not logged in:', userInfo?.role);
            setRequestError("Only logged-in Journalists can request a test drive.");
            return;
        }
        
        setRequestLoading(true);
        setRequestError('');
        setRequestSuccess('');
        
        try {            // If there's an existing request, withdraw it
            if (existingRequest) {
                console.log(`Attempting to withdraw request with ID: ${existingRequest._id}`);
                console.log('Full existingRequest object:', JSON.stringify(existingRequest, null, 2));
                
                if (!existingRequest._id) {
                    console.error('Missing request ID in existingRequest object!');
                    setRequestError("Cannot withdraw request: Request ID is missing.");
                    return;
                }
                
                try {
                    const result = await withdrawTestDriveRequest(existingRequest._id);
                    console.log('Request withdrawn successfully:', result);
                    setRequestSuccess(result.message || "Test drive request successfully withdrawn.");
                    setExistingRequest(null);
                    
                    // Refresh the request status after withdrawal
                    setTimeout(() => {
                        refreshRequestStatus();
                    }, 1000);
                } catch (err) {
                    const errorMsg = err.message || err.response?.data?.message || "Failed to withdraw test drive request.";
                    console.error(`Error withdrawing request: ${errorMsg}`, err);
                    setRequestError(errorMsg);
                    
                    // Refresh anyway in case the request was actually withdrawn but there was a communication error
                    setTimeout(() => {
                        refreshRequestStatus();
                    }, 1000);
                }
            }            // Otherwise, redirect to journalist dashboard with the car pre-selected
            else {
                console.log(`Redirecting to journalist dashboard for car: ${carId}`);
                // Navigate to journalist dashboard with state to indicate which car was selected
                navigate('/journalist/dashboard', { 
                    state: { 
                        activeTab: 'new', 
                        selectedCarId: carId,
                        carDetails: car // Pass the car details to display in the form
                    } 
                });
                return;
            }} catch (err) {
            console.error('Unexpected error in handleTestDriveRequest:', err);
            setRequestError("An unexpected error occurred. Please try again later.");
            
            // Try to refresh anyway in case the operation succeeded but had a communication error
            setTimeout(() => {
                refreshRequestStatus();
            }, 1000);
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
        <div className="bg-theme-black-900 bg-opacity-80 rounded-lg shadow-purple-glow overflow-hidden p-6 md:p-8 lg:p-10 border border-theme-purple-700 backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image Section */}                <div>                    <div className="relative overflow-hidden rounded-lg shadow-md mb-4 bg-theme-black-800 border border-theme-purple-600">
                        <img
                            src={currentImage || placeholderImage}
                            alt={`${car.make} ${car.model}`}
                            className="w-full h-auto object-cover max-h-96"
                            onError={(e) => { 
                                console.log('Image failed to load:', e.target.src);
                                e.target.onerror = null; 
                                e.target.src = placeholderImage; 
                            }}
                        />
                    </div>
                    
                    {/* Image gallery */}
                    {galleryImages.length > 1 && (
                        <div className="flex space-x-2 overflow-x-auto pb-2">
                            {galleryImages.map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    alt={`${car.make} ${car.model} - View ${index + 1}`}
                                    className={`h-16 w-20 object-cover rounded cursor-pointer transition-all duration-200 
                                               ${currentImage === img 
                                                   ? 'opacity-100 border-2 border-theme-purple-500 shadow-purple-glow' 
                                                   : 'opacity-75 hover:opacity-100 border border-transparent hover:border-theme-purple-400'}`}
                                    onClick={() => handleImageClick(img)}
                                    onError={(e) => { 
                                        e.target.onerror = null; 
                                        e.target.src = placeholderImage; 
                                        e.target.classList.add('opacity-50');
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Details Section */}
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-purple-gradient mb-2">
                        {car.year} {car.make} {car.model}
                    </h1>
                    <p className="text-lg text-theme-purple-300 mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1.5 text-theme-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {car.location}
                    </p>

                    <div className="mb-6 border-t border-theme-purple-800 pt-4">
                        <h3 className="text-xl font-semibold text-theme-purple-200 mb-3">Description</h3>
                        <p className="text-gray-300 whitespace-pre-wrap">{car.description}</p>
                    </div>

                    <div className="mb-6 border-t border-theme-purple-800 pt-4">
                        <h3 className="text-xl font-semibold text-theme-purple-200 mb-3">Car Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-gray-400">Make:</p>
                                <p className="text-white">{car.make}</p>
                            </div>
                            <div>
                                <p className="text-gray-400">Model:</p>
                                <p className="text-white">{car.model}</p>
                            </div>
                            <div>
                                <p className="text-gray-400">Year:</p>
                                <p className="text-white">{car.year}</p>
                            </div>
                            <div>
                                <p className="text-gray-400">Color:</p>
                                <p className="text-white">{car.color}</p>
                            </div>
                            <div>
                                <p className="text-gray-400">Transmission:</p>
                                <p className="text-white">{car.transmission}</p>
                            </div>
                            <div>
                                <p className="text-gray-400">Fuel Type:</p>
                                <p className="text-white">{car.fuelType}</p>
                            </div>
                            <div>
                                <p className="text-gray-400">Mileage:</p>
                                <p className="text-white">{car.mileage} km</p>
                            </div>
                            <div>
                                <p className="text-gray-400">Price per day:</p>
                                <p className="text-white font-bold text-xl text-transparent bg-clip-text bg-purple-gradient">₹{car.price}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 border-t border-theme-purple-800 pt-4">
                        <h3 className="text-xl font-semibold text-theme-purple-200 mb-3">Owner Information</h3>
                        {car.owner ? (
                            <p className="text-gray-300">Listed by: {car.owner.name} ({car.owner.email})</p>
                        ) : (
                            <p className="text-gray-500 italic">Owner information not available.</p>
                        )}
                    </div>

                    <div className="mb-6 border-t border-theme-purple-800 pt-4">
                        <h3 className="text-xl font-semibold text-theme-purple-200 mb-3">Availability</h3>
                        <p className={`text-lg font-medium ${car.isAvailable ? 'text-green-400' : 'text-red-400'}`}>
                            {car.isAvailable ? 'Available for Test Drive' : 'Currently Unavailable'}
                        </p>
                    </div>                    {/* Test Drive Request Button Area */}
                    {canRequestTestDrive && (
                        <div className="border-t border-theme-purple-800 pt-6">
                            <button
                                onClick={(e) => {
                                    e.preventDefault(); // Prevent any default behavior
                                    console.log('Test drive button clicked');
                                    handleTestDriveRequest();
                                }}
                                disabled={requestLoading}
                                className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                                    ${existingRequest 
                                        ? 'bg-orange-700 hover:bg-orange-600 border-orange-800' 
                                        : 'gradient-button shadow-purple-glow'} 
                                    disabled:opacity-60 disabled:cursor-not-allowed 
                                    transition duration-300 ease-in-out transform hover:scale-102`}
                                data-testid="test-drive-button"
                            >
                                {requestLoading 
                                    ? (existingRequest ? 'Withdrawing...' : 'Requesting...') 
                                    : (existingRequest 
                                        ? `Withdraw Request (${existingRequest.status})` 
                                        : 'Request Test Drive'
                                    )
                                }
                            </button>
                            {requestError && (
                                <div className="text-sm text-red-400 text-center mt-2 p-2 bg-red-900 bg-opacity-25 rounded border border-red-800">
                                    <p>{requestError}</p>
                                    <button 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            refreshRequestStatus();
                                            setRequestError('');
                                        }} 
                                        className="text-xs text-theme-purple-300 underline mt-1 hover:text-theme-purple-200"
                                    >
                                        Refresh status
                                    </button>
                                </div>
                            )}
                            {requestSuccess && (
                                <p className="text-sm text-green-400 text-center mt-2 p-2 bg-green-900 bg-opacity-25 rounded border border-green-800">
                                    {requestSuccess}
                                </p>
                            )}
                            
                            {/* Show additional status information if there's an existing request */}
                            {existingRequest && !requestSuccess && (
                                <div className="mt-3 text-sm text-gray-300 bg-theme-black-800 p-3 rounded border border-theme-purple-700">
                                    <p className="flex items-center">
                                        <span className="mr-2">📅</span>
                                        <span>Requested on: {new Date(existingRequest.createdAt).toLocaleDateString()}</span>
                                    </p>
                                    {existingRequest.ownerResponse && (
                                        <p className="mt-2 flex items-center">
                                            <span className="mr-2">💬</span>
                                            <span>Owner response: "{existingRequest.ownerResponse}"</span>
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    {!car.isAvailable && userInfo?.role === 'Journalist' && (
                        <p className="text-sm text-yellow-400 text-center mt-4 border-t border-theme-purple-800 pt-4">This car is currently marked as unavailable by the owner.</p>
                    )}
                    {userInfo?.role === 'Car Owner' && userInfo?._id === car.owner?._id && (
                        <p className="text-sm text-theme-purple-400 text-center mt-4 border-t border-theme-purple-800 pt-4">This is your car listing.</p>
                    )}
                    
                    {/* Link back to all cars */}
                    <div className="mt-6 text-center border-t border-theme-purple-800 pt-4">
                        <Link to="/" className="text-theme-purple-400 hover:text-theme-purple-300 transition duration-150 ease-in-out">
                            ← Back to Listings
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CarDetailsPage;