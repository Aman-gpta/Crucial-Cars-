// frontend/src/components/cars/CarCard.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { deleteCar } from '../../services/carService';

const CarCard = ({ car, onDelete }) => {
    const [deleting, setDeleting] = useState(false);
    const { userInfo } = useAuth();
    const navigate = useNavigate();    // Basic placeholder image if no images are provided
    const imageUrl = car.images && car.images.length > 0 
        ? car.images[0] 
        : car.image 
            ? (car.image.startsWith('http') 
                ? car.image 
                : car.image.startsWith('/uploads/') 
                    ? car.image 
                    : `/uploads/${car.image}`)
            : 'https://via.placeholder.com/400x300.png?text=No+Image';

    // Check if current user is the owner of this car
    const isOwner = userInfo && car.owner && userInfo._id === car.owner._id;

    // Handle delete car
    const handleDelete = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!window.confirm('Are you sure you want to delete this car listing?')) {
            return;
        }

        try {
            setDeleting(true);
            await deleteCar(car._id);

            // If onDelete prop is provided, call it to update the UI
            if (onDelete) {
                onDelete(car._id);
            } else {
                // Otherwise, navigate to home page
                navigate('/');
            }
        } catch (error) {
            console.error('Error deleting car:', error);
            alert('Failed to delete the car. Please try again.');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl flex flex-col">
            {/* Image */}
            <Link to={`/cars/${car._id}`} className="block h-48 overflow-hidden"> {/* Fixed height for image area */}
                <img
                    src={imageUrl}
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-full object-cover" // Ensure image covers the area
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x300.png?text=Image+Error' }} // Handle image loading errors
                />
            </Link>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow"> {/* Added flex-grow */}
                <h3 className="text-xl font-semibold text-gray-800 mb-1 truncate">
                    <Link to={`/cars/${car._id}`} className="hover:text-indigo-600">
                        {car.year} {car.make} {car.model}
                    </Link>
                </h3>
                <p className="text-sm text-gray-500 mb-3">{car.location}</p>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow"> {/* Added flex-grow for description */}
                    {car.description}
                </p>

                {/* Pricing */}
                <div className="flex justify-between items-center mb-3">
                    <span className="text-lg font-bold text-indigo-600">₹{car.price}/day</span>
                </div>

                {/* Action Buttons */}
                <div className="mt-auto pt-3 border-t border-gray-200 space-y-2"> {/* Pushes button to bottom */}
                    <Link
                        to={`/cars/${car._id}`}
                        className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out w-full text-center"
                    >
                        View Details
                    </Link>

                    {/* Delete Button - Only show if user is the owner */}
                    {isOwner && (
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="inline-block bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out w-full text-center"
                        >
                            {deleting ? 'Deleting...' : 'Delete Listing'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CarCard;