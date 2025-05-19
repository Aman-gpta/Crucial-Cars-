// frontend/src/pages/NotFoundPage.js
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
    return (        <div className="flex flex-col items-center justify-center py-20 px-4 animate-fadeIn">
            <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-purple-gradient mb-4">404</h1>
            <h2 className="text-3xl font-semibold text-theme-purple-300 mb-6">Page Not Found</h2>
            <p className="text-gray-400 mb-8 max-w-md text-center">Sorry, the page you are looking for seems to have taken a wrong turn at the last intersection.</p>
            <div className="h-1 w-20 bg-theme-purple-700 mb-8 rounded-full"></div>
            <Link
                to="/"
                className="gradient-button text-white font-medium py-3 px-8 rounded-lg transition duration-300 shadow-purple-glow transform hover:scale-105"
            >
                Back to Home
            </Link>
        </div>
    );
};

export default NotFoundPage;