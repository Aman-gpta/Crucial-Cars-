// frontend/src/pages/NotFoundPage.js
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
    return (
        <div className="text-center py-20">
            <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
            <h2 className="text-3xl font-semibold text-gray-700 mb-6">Page Not Found</h2>
            <p className="text-gray-500 mb-8">Sorry, the page you are looking for does not exist.</p>
            <Link
                to="/"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
                Go Back Home
            </Link>
        </div>
    );
};
export default NotFoundPage;