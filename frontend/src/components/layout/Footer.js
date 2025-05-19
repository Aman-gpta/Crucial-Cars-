// frontend/src/components/layout/Footer.js
import React from 'react';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    return (
        <footer className="bg-gray-800 text-gray-300 py-6 mt-auto">
            <div className="container mx-auto px-4 text-center">
                <p>© {currentYear} CrucialCars Test Drive. All rights reserved.</p>
                {/* Add other footer links if needed */}
            </div>
        </footer>
    );
};

export default Footer;