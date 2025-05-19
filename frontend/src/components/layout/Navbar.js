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
        // --- Navbar Structure with Tailwind ---
        // Added sticky top and z-index to keep it visible when scrolling
        <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center">

                {/* Logo/Brand - Links to Home */}
                <Link to="/" className="text-2xl font-bold hover:text-blue-200 transition duration-300 mb-2 md:mb-0">
                    CrucialCars <span className="text-sm font-light">Test Drive</span>
                </Link>                {/* Hamburger Icon for Mobile Menu */}
                <div className="md:hidden flex items-center absolute top-4 right-4">
                    <button
                        onClick={toggleMobileMenu}
                        className="text-white focus:outline-none w-8 h-8 relative"
                        aria-label="Toggle navigation menu"
                    >
                        {/* Use simple div elements instead of SVG for better control */}
                        <div className={`absolute h-0.5 w-6 bg-white transform transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'rotate-45 top-4' : 'rotate-0 top-2'}`}></div>
                        <div className={`absolute h-0.5 w-6 bg-white transform transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'} top-4`}></div>
                        <div className={`absolute h-0.5 w-6 bg-white transform transition-all duration-300 ease-in-out ${isMobileMenuOpen ? '-rotate-45 top-4' : 'rotate-0 top-6'}`}></div>
                    </button>
                </div>

                {/* Navigation Links List */}
                <ul
                    className={`flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 mt-3 md:mt-0 ${isMobileMenuOpen ? 'flex' : 'hidden md:flex'
                        }`}
                >
                    {/* Common Link */}
                    <li>
                        <Link to="/" className="hover:text-blue-200 transition duration-300">Browse Cars</Link>
                    </li>

                    {/* --- Conditional Links based on Auth State --- */}
                    {isAuthenticated ? ( // <-- THIS CONDITION MUST BE TRUE
                        <>
                            {/* Links for LOGGED-IN users */}
                            <li>
                                <Link to={dashboardLink} className="hover:text-blue-200 transition duration-300">Dashboard</Link>
                            </li>

                            {/* Link only for Car Owners */}
                            {userInfo?.role === 'Car Owner' && ( // Check role safely
                                <li>
                                    <Link to="/cars/new" className="hover:text-blue-200 transition duration-300">List My Car</Link>
                                </li>
                            )}

                            {/* User Info and Logout Button */}
                            <li className="flex items-center pt-2 md:pt-0"> {/* Added padding top for mobile */}
                                {/* Use optional chaining for name */}
                                <span className="mr-3 hidden sm:inline">Hi, {userInfo?.name}!</span>
                                <button // <-- THIS BUTTON SHOULD APPEAR
                                    onClick={handleLogout} // Attach logout handler
                                    className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm transition duration-300"
                                    aria-label="Logout"
                                >
                                    Logout
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            {/* Links for LOGGED-OUT users */}
                            <li>
                                <Link to="/login" className="hover:text-blue-200 transition duration-300">Login</Link>
                            </li>
                            <li>
                                <Link to="/register" className="bg-white text-blue-600 hover:bg-gray-200 px-3 py-1 rounded text-sm font-medium transition duration-300">
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