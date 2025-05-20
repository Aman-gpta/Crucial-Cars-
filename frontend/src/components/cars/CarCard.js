// frontend/src/components/cars/CarCard.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { deleteCar } from '../../services/carService';
import Spinner from '../layout/Spinner';

const CarCard = ({ car, onDelete }) => {
    const [deleting, setDeleting] = useState(false);
    const { userInfo } = useAuth();
    const navigate = useNavigate();    // Basic placeholder image if no images are provided
    const imageUrl = car.image 
        ? (car.image.startsWith('http') 
            ? car.image 
            : `http://localhost:5000${car.image.startsWith('/uploads') 
                ? car.image 
                : `/uploads/${car.image}`}`) 
        : (car.images && car.images.length > 0 
            ? (car.images[0].startsWith('http')
                ? car.images[0]
                : `http://localhost:5000${car.images[0].startsWith('/uploads')
                    ? car.images[0]
                    : `/uploads/${car.images[0]}`}`)
            : 'https://via.placeholder.com/400x300.png?text=No+Image');

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
    };    return (
        <div className="bg-theme-black-900 bg-opacity-80 rounded-lg border border-theme-purple-700 shadow-purple-glow overflow-hidden transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-purple-neon flex flex-col animate-slideInUp transform hover:-translate-y-1">
            {/* Image */}
            <Link to={`/cars/${car._id}`} className="block h-48 overflow-hidden relative group"> {/* Fixed height for image area */}
                <div className="absolute inset-0 bg-theme-purple-900 opacity-0 group-hover:opacity-20 transition-opacity duration-300 z-10"></div>
                <img
                    src={imageUrl}
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" // Ensure image covers the area with zoom effect
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x300.png?text=Image+Error' }} // Handle image loading errors
                />
            </Link>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow"> {/* Added flex-grow */}
                <h3 className="text-xl font-semibold text-theme-purple-200 mb-1 truncate">
                    <Link to={`/cars/${car._id}`} className="hover:text-theme-purple-400 transition-colors duration-300">
                        {car.year} {car.make} {car.model}
                    </Link>
                </h3>
                <p className="text-sm text-theme-purple-400 mb-3">{car.location}</p>
                <p className="text-gray-300 text-sm mb-4 line-clamp-3 flex-grow"> {/* Added flex-grow for description */}
                    {car.description}
                </p>

                {/* Pricing */}
                <div className="flex justify-between items-center mb-3">
                    <span className="text-lg font-bold text-transparent bg-clip-text bg-purple-gradient">₹{car.price}/day</span>
                </div>

                {/* Action Buttons */}
                <div className="mt-auto pt-3 border-t border-theme-purple-800 space-y-2"> {/* Pushes button to bottom */}
                    <Link
                        to={`/cars/${car._id}`}
                        className="inline-block gradient-button text-white text-sm font-medium py-2 px-4 rounded-md transition-all duration-300 ease-in-out w-full text-center hover:shadow-purple-glow"
                    >
                        View Details
                    </Link>

                    {/* Delete Button - Only show if user is the owner */}
                    {isOwner && (
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="inline-block bg-red-900 hover:bg-red-800 text-white text-sm font-medium py-2 px-4 rounded-md transition-all duration-300 ease-in-out w-full text-center border border-red-700"
                        >
                            {deleting ? <Spinner size="small" /> : 'Delete Listing'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CarCard;