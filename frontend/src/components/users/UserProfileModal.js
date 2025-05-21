// frontend/src/components/users/UserProfileModal.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../layout/Spinner';

const UserProfileModal = ({ userId, isOpen, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState(null);
    const [error, setError] = useState(null);
    const { getPublicUserProfile } = useAuth();
    
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (userId && isOpen) {
                setLoading(true);
                setError(null);
                
                try {
                    const data = await getPublicUserProfile(userId);
                    if (data) {
                        setProfileData(data);
                    } else {
                        setError('Could not load user profile');
                    }
                } catch (err) {
                    setError(err.message || 'Error loading profile');
                    console.error('Error fetching user profile:', err);
                } finally {
                    setLoading(false);
                }
            }
        };
        
        fetchUserProfile();
    }, [userId, isOpen, getPublicUserProfile]);
    
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-auto bg-theme-black-800 rounded-lg shadow-purple-glow border border-theme-purple-700 p-6">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-theme-purple-300 hover:text-theme-purple-100"
                    aria-label="Close modal"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
                
                {/* Modal content */}
                <div className="pt-4">
                    <h2 className="text-2xl font-bold text-theme-purple-200 mb-4">User Profile</h2>
                    
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Spinner size="large" />
                        </div>
                    ) : error ? (
                        <div className="text-red-400 p-4 bg-red-900 bg-opacity-20 rounded-md">
                            {error}
                        </div>
                    ) : profileData ? (
                        <div className="space-y-6">
                            {/* Profile header with image */}
                            <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                    {profileData.profileImage ? (
                                        <img 
                                            src={profileData.profileImage} 
                                            alt={profileData.name} 
                                            className="w-20 h-20 rounded-full object-cover border-2 border-theme-purple-600"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 rounded-full bg-theme-purple-900 flex items-center justify-center">
                                            <span className="text-2xl font-bold text-theme-purple-200">
                                                {profileData.name?.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-theme-purple-100">{profileData.name}</h3>
                                    <p className="text-theme-purple-300">{profileData.role}</p>
                                    {profileData.location && (
                                        <p className="text-gray-400">{profileData.location}</p>
                                    )}
                                </div>
                            </div>
                            
                            {/* Bio section */}
                            {profileData.bio && (
                                <div className="bg-theme-black-900 p-4 rounded-lg">
                                    <h4 className="text-theme-purple-300 font-semibold mb-2">About</h4>
                                    <p className="text-white">{profileData.bio}</p>
                                </div>
                            )}
                            
                            {/* Role-specific information */}
                            {profileData.role === 'Journalist' && profileData.journalistInfo && (
                                <div className="bg-theme-black-900 p-4 rounded-lg">
                                    <h4 className="text-theme-purple-300 font-semibold mb-2">Journalist Information</h4>
                                    {profileData.journalistInfo.publication && (
                                        <div className="mb-2">
                                            <span className="text-gray-400">Publication: </span>
                                            <span className="text-white">{profileData.journalistInfo.publication}</span>
                                        </div>
                                    )}
                                    {profileData.journalistInfo.specialization && (
                                        <div>
                                            <span className="text-gray-400">Specialization: </span>
                                            <span className="text-white">{profileData.journalistInfo.specialization}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {profileData.role === 'Car Owner' && profileData.ownerInfo && (
                                <div className="bg-theme-black-900 p-4 rounded-lg">
                                    <h4 className="text-theme-purple-300 font-semibold mb-2">Owner Information</h4>
                                    {profileData.ownerInfo.businessName && (
                                        <div>
                                            <span className="text-gray-400">Business: </span>
                                            <span className="text-white">{profileData.ownerInfo.businessName}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {/* Social Media */}
                            {profileData.socialMedia && Object.values(profileData.socialMedia).some(link => link) && (
                                <div className="bg-theme-black-900 p-4 rounded-lg">
                                    <h4 className="text-theme-purple-300 font-semibold mb-2">Social Media</h4>
                                    <div className="flex flex-wrap gap-4">
                                        {profileData.socialMedia.website && (
                                            <a
                                                href={profileData.socialMedia.website.startsWith('http') 
                                                    ? profileData.socialMedia.website 
                                                    : `https://${profileData.socialMedia.website}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-theme-purple-400 hover:text-theme-purple-200 transition"
                                            >
                                                Website
                                            </a>
                                        )}
                                        {profileData.socialMedia.linkedin && (
                                            <a
                                                href={profileData.socialMedia.linkedin.startsWith('http') 
                                                    ? profileData.socialMedia.linkedin 
                                                    : `https://linkedin.com/in/${profileData.socialMedia.linkedin}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-theme-purple-400 hover:text-theme-purple-200 transition"
                                            >
                                                LinkedIn
                                            </a>
                                        )}
                                        {profileData.socialMedia.twitter && (
                                            <a
                                                href={profileData.socialMedia.twitter.startsWith('http') 
                                                    ? profileData.socialMedia.twitter 
                                                    : `https://twitter.com/${profileData.socialMedia.twitter}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-theme-purple-400 hover:text-theme-purple-200 transition"
                                            >
                                                Twitter
                                            </a>
                                        )}
                                        {profileData.socialMedia.instagram && (
                                            <a
                                                href={profileData.socialMedia.instagram.startsWith('http') 
                                                    ? profileData.socialMedia.instagram 
                                                    : `https://instagram.com/${profileData.socialMedia.instagram}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-theme-purple-400 hover:text-theme-purple-200 transition"
                                            >
                                                Instagram
                                            </a>
                                        )}
                                        {profileData.socialMedia.youtube && (
                                            <a
                                                href={profileData.socialMedia.youtube.startsWith('http') 
                                                    ? profileData.socialMedia.youtube 
                                                    : `https://youtube.com/${profileData.socialMedia.youtube}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-theme-purple-400 hover:text-theme-purple-200 transition"
                                            >
                                                YouTube
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-gray-400 text-center py-8">
                            No profile data available
                        </div>
                    )}
                </div>
                
                {/* Footer */}
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-theme-purple-800 text-white rounded hover:bg-theme-purple-700 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserProfileModal;
