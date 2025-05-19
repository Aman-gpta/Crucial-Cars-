// frontend/src/pages/UserProfilePage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/layout/Spinner';

const UserProfilePage = () => {
    const { userInfo } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: '',
        profileImage: ''
    });

    useEffect(() => {
        // Load user data from userInfo
        if (userInfo) {
            setFormData({
                name: userInfo.name || '',
                email: userInfo.email || '',
                role: userInfo.role || '',
                profileImage: userInfo.profileImage || ''
            });
        }
    }, [userInfo]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Implement profile update logic here
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            alert('Profile updated successfully!');
        }, 1000);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (!userInfo) {
        return (
            <div className="text-center py-12 bg-theme-black-900 bg-opacity-80 rounded-lg shadow-purple-glow p-6 max-w-lg mx-auto mt-10 border border-theme-purple-700">
                <p className="text-theme-purple-300">Please log in to view your profile.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-theme-black-900 bg-opacity-80 rounded-lg shadow-purple-glow p-6 max-w-2xl mx-auto border border-theme-purple-700 backdrop-blur-sm animate-fadeIn">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-purple-gradient mb-6">Your Profile</h1>

                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-theme-purple-600 shadow-purple-glow">
                        <img 
                            src={formData.profileImage || "https://via.placeholder.com/150?text=Profile"} 
                            alt={formData.name}
                            className="w-full h-full object-cover" 
                        />
                    </div>
                    
                    <div className="flex-1">
                        <h2 className="text-2xl font-semibold text-theme-purple-300 mb-2">{formData.name}</h2>
                        <p className="text-theme-purple-400 mb-1">{formData.email}</p>
                        <span className="inline-block px-3 py-1 rounded-full text-sm bg-theme-purple-900 text-theme-purple-300 border border-theme-purple-700">
                            {formData.role}
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="border-t border-theme-purple-800 pt-6">
                        <h3 className="text-xl font-semibold text-theme-purple-300 mb-4">Edit Profile</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-theme-purple-300 mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 rounded-md bg-theme-black-800 border-theme-purple-600 text-white shadow-sm focus:border-theme-purple-500 focus:ring-theme-purple-500"
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-theme-purple-300 mb-1">
                                    Email (Cannot be changed)
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    disabled
                                    className="w-full px-3 py-2 rounded-md bg-theme-black-800 border-theme-purple-600 text-gray-500 shadow-sm"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="gradient-button text-white font-medium py-2 px-6 rounded shadow-purple-glow transform hover:scale-105 transition duration-300"
                        >
                            {loading ? <Spinner size="small" /> : 'Update Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserProfilePage;