// frontend/src/components/layout/Navbar.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate for logout redirection
import { useAuth } from '../../context/AuthContext'; // <-- Import useAuth hook

const Navbar = () => {
    // --- Get Auth State & Functions from Context ---
    const { userInfo, isAuthenticated, logout } = useAuth(); // Use the context hook
    const navigate = useNavigate();

    // Add console log HERE to check state within Navbar
    console.log("Navbar Check - isAuthenticated:", isAuthenticated, "userInfo:", userInfo);

    // --- Logout Handler ---
    const handleLogout = () => {
        logout(); // Call logout from context
        navigate('/login'); // Redirect to login page after logout
    };

    // --- Determine Dashboard Link Dynamically ---
    // Use optional chaining (?.) in case userInfo is null initially
    const dashboardLink = userInfo?.role === 'Car Owner' ? "/owner/dashboard" : "/journalist/dashboard";

    // Add state for mobile menu toggle
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Toggle function for mobile menu
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        // --- Navbar Structure with Enhanced Purple-Black Theme ---
        <nav className="bg-gradient-to-r from-theme-purple-900 to-theme-black-950 text-white shadow-purple-glow sticky top-0 z-50 animate-fadeIn py-4">
            <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">

                {/* Logo/Brand - Links to Home without animation */}
                <div className="flex items-center w-full md:w-auto justify-between">
                    <Link to="/" className="text-2xl font-bold text-transparent bg-clip-text bg-purple-gradient hover:text-theme-purple-300 transition duration-300 mb-2 md:mb-0">
                        <span className="flex items-center">
                            CrucialCars <span className="text-sm font-light text-theme-purple-300 ml-1">Test Drive</span>
                        </span>
                    </Link>
                    
                    {/* Enhanced Hamburger Icon for Mobile Menu */}
                    <div className="md:hidden flex items-center absolute top-4 right-4">
                        <button
                            onClick={toggleMobileMenu}
                            className="text-white focus:outline-none w-12 h-12 rounded-full bg-theme-black-800 border-2 border-theme-purple-600 flex items-center justify-center transition-all duration-300 hover:shadow-purple-neon hover:border-theme-purple-400"
                            aria-label="Toggle navigation menu"
                        >
                            {/* Smoother hamburger animation */}
                            <div className="relative w-6 h-6">
                                <div className={`absolute h-0.5 w-6 bg-theme-purple-400 transform transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'rotate-45 top-3' : 'rotate-0 top-1.5'}`}></div>
                                <div className={`absolute h-0.5 w-6 bg-theme-purple-400 transform transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'} top-3`}></div>
                                <div className={`absolute h-0.5 w-6 bg-theme-purple-400 transform transition-all duration-300 ease-in-out ${isMobileMenuOpen ? '-rotate-45 top-3' : 'rotate-0 top-4.5'}`}></div>
                            </div>
                        </button>
                    </div>
                </div>
                
                {/* Enhanced Navigation Links List with better spacing */}
                <ul
                    className={`flex-col md:flex-row items-center space-y-5 md:space-y-0 md:space-x-6 mt-5 md:mt-0 w-full md:w-auto ${isMobileMenuOpen ? 'flex animate-slideInUp' : 'hidden md:flex'}`}
                >
                    {/* Common Link with enhanced rounded button - no scale */}
                    <li>
                        <Link to="/" className="px-6 py-2.5 rounded-full bg-theme-black-800 border-2 border-theme-purple-600 text-theme-purple-300 hover:text-white hover:bg-theme-purple-800 transition-all duration-300 hover:shadow-purple-neon font-medium animate-shadow-pulse">
                            Browse Cars
                        </Link>
                    </li>

                    {/* --- Conditional Links based on Auth State --- */}
                    {isAuthenticated ? ( // <-- THIS CONDITION MUST BE TRUE
                        <>
                            {/* Links for LOGGED-IN users with enhanced buttons - no scale */}
                            <li>
                                <Link to={dashboardLink} className="px-6 py-2.5 rounded-full bg-theme-black-800 border-2 border-theme-purple-600 text-theme-purple-300 hover:text-white hover:bg-theme-purple-800 transition-all duration-300 hover:shadow-purple-neon font-medium">
                                    Dashboard
                                </Link>
                            </li>

                            {/* Link only for Car Owners with enhanced button - no scale */}
                            {userInfo?.role === 'Car Owner' && ( // Check role safely
                                <li>
                                    <Link to="/cars/new" className="px-6 py-2.5 rounded-full bg-theme-black-800 border-2 border-theme-purple-600 text-theme-purple-300 hover:text-white hover:bg-theme-purple-800 transition-all duration-300 hover:shadow-purple-neon font-medium">
                                        List My Car
                                    </Link>
                                </li>
                            )}

                            {/* User Info and Logout Button with enhanced styling */}
                            <li className="flex items-center space-x-4 pt-3 md:pt-0"> {/* Increased padding for mobile */}
                                {/* Enhanced user greeting badge */}
                                <span className="hidden sm:inline text-theme-purple-200 bg-theme-black-800 px-4 py-1.5 rounded-full border-2 border-theme-purple-600">Hi, {userInfo?.name}!</span>
                                <button // <-- THIS BUTTON SHOULD APPEAR
                                    onClick={handleLogout} // Attach logout handler
                                    className="gradient-button px-6 py-2.5 rounded-full text-white font-medium transition-all duration-300 hover:shadow-purple-neon transform hover:scale-105"
                                    aria-label="Logout"
                                >
                                    Logout
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            {/* Links for LOGGED-OUT users with enhanced buttons */}
                            <li>
                                <Link to="/login" className="px-6 py-2.5 rounded-full bg-theme-black-800 border-2 border-theme-purple-600 text-theme-purple-300 hover:text-white hover:bg-theme-purple-800 transition-all duration-300 hover:shadow-purple-neon transform hover:scale-105 font-medium">
                                    Login
                                </Link>
                            </li>
                            <li>
                                <Link to="/register" className="gradient-button px-6 py-2.5 rounded-full text-white font-medium transition-all duration-300 hover:shadow-purple-neon transform hover:scale-105">
                                    Register
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
