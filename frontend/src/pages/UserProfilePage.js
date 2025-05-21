// frontend/src/pages/UserProfilePage.js
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/layout/Spinner';
import { useParams, Link, useNavigate } from 'react-router-dom';

const UserProfilePage = () => {
    const { userInfo, getUserProfile, updateUserProfile, getPublicUserProfile, error, setError } = useAuth();
    const [loading, setLoading] = useState(true);
    const [isPublicProfile, setIsPublicProfile] = useState(false);
    const [profileOwner, setProfileOwner] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [updateSuccess, setUpdateSuccess] = useState('');
    const fileInputRef = useRef(null);
    
    const { id: profileId } = useParams();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: '',
        profileImage: '',
        bio: '',
        phone: '',
        location: '',
        socialMedia: {
            youtube: '',
            instagram: '',
            twitter: '',
            linkedin: '',
            website: ''
        },
        journalistInfo: {
            publication: '',
            experience: 0,
            specialization: ''
        },
        ownerInfo: {
            preferredContactMethod: 'email',
            businessName: ''
        },
        password: '',
        confirmPassword: ''
    });    useEffect(() => {
        const loadProfileData = async () => {
            setLoading(true);
            setError(null);
            
            try {
                // Check if user is logged in when viewing own profile
                if (!profileId && !userInfo) {
                    console.log("No profile ID and not logged in. Redirecting to login.");
                    navigate('/login', { state: { from: '/profile' } });
                    return;
                }
                
                if (profileId) {
                    // This is a public profile view
                    console.log("Loading public profile for ID:", profileId);
                    setIsPublicProfile(true);
                    const profileData = await getPublicUserProfile(profileId);
                    
                    if (profileData) {
                        console.log("Public profile data loaded successfully:", profileData);
                        console.log("Public profile user role:", profileData.role);
                        setProfileOwner(profileData);
                    } else {
                        console.log("No profile data found, navigating to 404");
                        navigate('/not-found');
                    }
                } else {
                    // This is the user's own profile
                    console.log("Loading user's own profile", userInfo);
                    console.log("User role from userInfo:", userInfo?.role);
                      try {
                        console.log("About to call getUserProfile with token:", 
                            userInfo?.token ? `${userInfo.token.substring(0, 10)}...` : "No token");
                        
                        const profileData = await getUserProfile();
                        
                        if (profileData) {
                            console.log("User profile data loaded successfully:", profileData);
                            console.log("User role from profile data:", profileData.role);
                            console.log("Role-specific data:", 
                                profileData.role === 'Journalist' ? 
                                    JSON.stringify(profileData.journalistInfo) : 
                                    JSON.stringify(profileData.ownerInfo)
                            );
                            
                            // Initialize default values for role-specific data
                            const initialJournalistInfo = {
                                publication: '',
                                experience: 0,
                                specialization: ''
                            };
                            
                            const initialOwnerInfo = {
                                preferredContactMethod: 'email',
                                businessName: ''
                            };
                            
                            // Determine which role-specific data to use based on user role
                            const journalistData = profileData.role === 'Journalist' ? 
                                profileData.journalistInfo || initialJournalistInfo : 
                                initialJournalistInfo;
                                
                            const ownerData = profileData.role === 'Car Owner' ? 
                                profileData.ownerInfo || initialOwnerInfo : 
                                initialOwnerInfo;
                            
                            setFormData(prevData => ({
                                // Use functional update to avoid dependency on formData
                                ...prevData,
                                name: profileData.name || '',
                                email: profileData.email || '',
                                role: profileData.role || '',
                                profileImage: profileData.profileImage || '',
                                bio: profileData.bio || '',
                                phone: profileData.phone || '',
                                location: profileData.location || '',
                                socialMedia: {
                                    youtube: profileData.socialMedia?.youtube || '',
                                    instagram: profileData.socialMedia?.instagram || '',
                                    twitter: profileData.socialMedia?.twitter || '',
                                    linkedin: profileData.socialMedia?.linkedin || '',
                                    website: profileData.socialMedia?.website || ''
                                },
                                journalistInfo: journalistData,
                                ownerInfo: ownerData,
                                password: '',
                                confirmPassword: ''
                            }));
                        } else {
                            console.log("No profile data retrieved from getUserProfile call");
                            // If AuthContext.error is not already set by getUserProfile,
                            // then set a generic one. 'error' here is the destructured error state from useAuth().
                            if (!error) { 
                                setError("Failed to load profile data. Please try refreshing the page.");
                            }
                            // If 'error' is already set, it means getUserProfile encountered an issue
                            // and provided a more specific error message, which we should preserve.
                        }
                    } catch (profileErr) {
                        console.error("Error in profile data retrieval:", profileErr);
                        setError(profileErr.message || "Failed to load profile data. Please try logging in again.");
                    }
                }
            } catch (err) {
                console.error("Error loading profile:", err);
                setError(err.message || "Failed to load profile data");
                if (err.response && err.response.status === 401) {
                    // Unauthorized - redirect to login
                    navigate('/login', { state: { from: '/profile' } });
                }
            } finally {
                setLoading(false);
            }
        };
        
        loadProfileData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profileId, userInfo, getUserProfile, getPublicUserProfile, navigate, setError]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Handle nested objects (socialMedia, journalistInfo, ownerInfo)
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleImageChange = (e) => {
        // In a real implementation, this would upload the image to a server/cloud storage
        // For now, we'll just use a preview URL
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setFormData(prev => ({
                ...prev,
                profileImage: previewUrl
            }));
            
            // Here you would typically upload the image to your server/cloud storage
            // and then update the profileImage with the returned URL
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdateSuccess('');
        setError(null);
        
        // Validate password confirmation if password is provided
        if (formData.password && formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        
        // Create submission object (excluding confirmPassword)
        const { confirmPassword, ...submissionData } = formData;
        
        // If password field is empty, remove it to prevent updating with empty password
        if (!submissionData.password) {
            delete submissionData.password;
        }
        
        // Clean up role-specific data to only send relevant fields based on user role
        if (submissionData.role === 'Journalist') {
            // Keep journalistInfo, remove ownerInfo for journalists
            delete submissionData.ownerInfo;
        } else if (submissionData.role === 'Car Owner') {
            // Keep ownerInfo, remove journalistInfo for car owners
            delete submissionData.journalistInfo;
        }
        
        console.log('Submitting profile update with data:', submissionData);
        setLoading(true);
        
        try {
            const result = await updateUserProfile(submissionData);
            
            if (result.success) {
                console.log('Profile updated successfully!');
                setUpdateSuccess("Profile updated successfully!");
                
                // Reset password fields
                setFormData(prev => ({
                    ...prev,
                    password: '',
                    confirmPassword: ''
                }));
            }
        } catch (err) {
            console.error("Error updating profile:", err);
        } finally {
            setLoading(false);
        }
    };
      // Define a reusable input field style with white background and black text for visibility
    const inputFieldStyle = "w-full px-3 py-2 rounded-md bg-white border border-theme-purple-600 text-black shadow-sm focus:border-theme-purple-500 focus:ring-theme-purple-500 focus:outline-none sm:text-sm transition-all duration-300";

    // Define a reusable select field style - same as input for consistency
    const selectFieldStyle = "w-full px-3 py-2 rounded-md bg-white border border-theme-purple-600 text-black shadow-sm focus:border-theme-purple-500 focus:ring-theme-purple-500 focus:outline-none sm:text-sm transition-all duration-300";

    // Define placeholder style - darker than default for better visibility
    const placeholderStyle = "placeholder:text-gray-600";
    
    // Form section style
    // const sectionStyle = "p-5 border border-theme-purple-700 rounded-lg bg-theme-black-800 bg-opacity-70 backdrop-filter backdrop-blur-sm mb-5";
    
    // Label style
    const labelStyle = "block text-sm font-medium text-theme-purple-200 mb-1";

    // Apply the input field style to all inputs via useEffect
    useEffect(() => {
        // This runs after the component mounts and updates all form inputs
        const applyInputStyles = () => {
            const formInputs = document.querySelectorAll('.profile-form input, .profile-form select, .profile-form textarea');
            formInputs.forEach(input => {
                input.classList.add('bg-white', 'text-black');
                input.classList.remove('bg-theme-black-800', 'text-white', 'text-gray-500');
            });
        };
        
        // Apply styles if component is mounted
        if (!loading) {
            setTimeout(applyInputStyles, 100); // slight delay to ensure DOM is updated
        }
    }, [loading, activeTab]);

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Spinner size="large" />
            </div>
        );
    }
      // Display errors if any
    if (error && !isPublicProfile) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-theme-black-900 bg-opacity-80 rounded-lg shadow-purple-glow p-6 max-w-2xl mx-auto border border-theme-purple-700 backdrop-blur-sm">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-theme-purple-300 mb-4">Profile Error</h2>
                        <p className="text-red-400 mb-6 p-3 bg-red-900 bg-opacity-20 rounded-md border border-red-700">
                            {error}
                        </p>
                        <div className="flex justify-center space-x-4 mt-6">
                            <button 
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 rounded-md bg-theme-purple-800 text-white hover:bg-theme-purple-700 transition-colors"
                            >
                                Try Again
                            </button>
                            <Link 
                                to="/login" 
                                className="px-4 py-2 rounded-md bg-theme-purple-600 text-white hover:bg-theme-purple-700 transition-colors"
                            >
                                Back to Login
                            </Link>
                            <Link 
                                to="/" 
                                className="px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-600 transition-colors"
                            >
                                Go to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // For public profile view
    if (isPublicProfile && profileOwner) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-theme-black-900 bg-opacity-80 rounded-lg shadow-purple-glow p-6 max-w-2xl mx-auto border border-theme-purple-700 backdrop-blur-sm animate-fadeIn">
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-purple-gradient mb-6">
                        {profileOwner.name}'s Profile
                    </h1>

                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-theme-purple-600 shadow-purple-glow">
                            <img 
                                src={profileOwner.profileImage || "https://via.placeholder.com/150?text=Profile"} 
                                alt={profileOwner.name}
                                className="w-full h-full object-cover" 
                            />
                        </div>
                        
                        <div className="flex-1">
                            <h2 className="text-2xl font-semibold text-theme-purple-300 mb-2">{profileOwner.name}</h2>
                            <div className="inline-block px-3 py-1 rounded-full text-sm bg-theme-purple-900 text-theme-purple-300 border border-theme-purple-700 mb-3">
                                {profileOwner.role}
                            </div>
                            
                            {profileOwner.bio && (
                                <p className="text-gray-300 mb-4">{profileOwner.bio}</p>
                            )}
                            
                            {profileOwner.location && (
                                <p className="text-theme-purple-400 mb-4">
                                    <i className="fas fa-map-marker-alt mr-2"></i>
                                    {profileOwner.location}
                                </p>
                            )}
                            
                            {/* Role-specific information */}
                            {profileOwner.role === 'Journalist' && profileOwner.journalistInfo && (
                                <div className="mt-4 bg-theme-black-800 rounded-lg p-4 border border-theme-purple-700">
                                    <h3 className="text-theme-purple-300 font-semibold mb-2">Journalist Information</h3>
                                    {profileOwner.journalistInfo.publication && (
                                        <p className="text-gray-300 mb-1">
                                            <span className="text-theme-purple-400 font-medium">Publication:</span> {profileOwner.journalistInfo.publication}
                                        </p>
                                    )}
                                    {profileOwner.journalistInfo.specialization && (
                                        <p className="text-gray-300">
                                            <span className="text-theme-purple-400 font-medium">Specialization:</span> {profileOwner.journalistInfo.specialization}
                                        </p>
                                    )}
                                </div>
                            )}
                            
                            {profileOwner.role === 'Car Owner' && profileOwner.ownerInfo && profileOwner.ownerInfo.businessName && (
                                <div className="mt-4 bg-theme-black-800 rounded-lg p-4 border border-theme-purple-700">
                                    <h3 className="text-theme-purple-300 font-semibold mb-2">Business Information</h3>
                                    <p className="text-gray-300">
                                        <span className="text-theme-purple-400 font-medium">Business Name:</span> {profileOwner.ownerInfo.businessName}
                                    </p>
                                </div>
                            )}
                            
                            {/* Social Media Links */}
                            {profileOwner.socialMedia && Object.values(profileOwner.socialMedia).some(link => link) && (
                                <div className="mt-6">
                                    <h3 className="text-theme-purple-300 font-semibold mb-3">Connect With {profileOwner.name}</h3>
                                    <div className="flex flex-wrap gap-4">
                                        {profileOwner.socialMedia.youtube && (
                                            <a 
                                                href={profileOwner.socialMedia.youtube}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-red-500 hover:text-red-400 transition-colors"
                                            >
                                                <i className="fab fa-youtube text-2xl"></i>
                                            </a>
                                        )}
                                        
                                        {profileOwner.socialMedia.instagram && (
                                            <a 
                                                href={profileOwner.socialMedia.instagram}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-pink-500 hover:text-pink-400 transition-colors"
                                            >
                                                <i className="fab fa-instagram text-2xl"></i>
                                            </a>
                                        )}
                                        
                                        {profileOwner.socialMedia.twitter && (
                                            <a 
                                                href={profileOwner.socialMedia.twitter}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:text-blue-400 transition-colors"
                                            >
                                                <i className="fab fa-twitter text-2xl"></i>
                                            </a>
                                        )}
                                        
                                        {profileOwner.socialMedia.linkedin && (
                                            <a 
                                                href={profileOwner.socialMedia.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-700 hover:text-blue-600 transition-colors"
                                            >
                                                <i className="fab fa-linkedin text-2xl"></i>
                                            </a>
                                        )}
                                        
                                        {profileOwner.socialMedia.website && (
                                            <a 
                                                href={profileOwner.socialMedia.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-theme-purple-400 hover:text-theme-purple-300 transition-colors"
                                            >
                                                <i className="fas fa-globe text-2xl"></i>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="mt-6 text-center">
                        <Link to="/" className="gradient-button text-white font-medium py-2 px-6 rounded shadow-purple-glow transition duration-300">
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // For editing own profile
    if (!userInfo) {
        return (
            <div className="text-center py-12 bg-theme-black-900 bg-opacity-80 rounded-lg shadow-purple-glow p-6 max-w-lg mx-auto mt-10 border border-theme-purple-700">
                <p className="text-theme-purple-300">Please log in to view your profile.</p>
                <Link to="/login" className="gradient-button text-white font-medium py-2 px-6 rounded shadow-purple-glow transform hover:scale-105 transition duration-300 inline-block mt-4">
                    Login
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 profile-page">
            <div className="bg-theme-black-900 bg-opacity-80 rounded-lg shadow-purple-glow p-6 max-w-4xl mx-auto border border-theme-purple-700 backdrop-blur-sm animate-fadeIn">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-purple-gradient mb-6">Your Profile</h1>

                {/* Profile Header with Image and Basic Info */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-8">
                    <div className="flex flex-col md:flex-row items-center mb-4 md:mb-0">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-theme-purple-600 shadow-purple-glow mr-0 md:mr-4 mb-4 md:mb-0">
                            <img 
                                src={formData.profileImage || "https://via.placeholder.com/150?text=Profile"}
                                alt={formData.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-theme-purple-300 text-center md:text-left">{formData.name}</h1>
                            <p className="text-gray-400 text-center md:text-left">{formData.email}</p>
                            <div className="inline-block px-3 py-1 rounded-full text-sm bg-theme-purple-900 text-theme-purple-300 border border-theme-purple-700 mt-2">
                                {formData.role || 'Loading...'}
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0">
                        <button 
                            onClick={() => fileInputRef.current.click()}
                            type="button"
                            className="gradient-button text-white font-medium py-2 px-4 rounded transition-all duration-300 flex items-center"
                        >
                            <i className="fas fa-camera mr-2"></i>
                            Change Photo
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleImageChange} 
                            className="hidden" 
                            accept="image/*"
                        />
                    </div>
                </div>

                {/* Profile Navigation Tabs */}
                <div className="border-b border-theme-purple-800 mb-6">
                    <nav className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'profile'
                                ? 'border-theme-purple-500 text-theme-purple-400'
                                : 'border-transparent text-gray-400 hover:text-theme-purple-300 hover:border-theme-purple-300'
                            }`}
                        >
                            Basic Info
                        </button>
                        <button
                            onClick={() => setActiveTab('social')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'social'
                                ? 'border-theme-purple-500 text-theme-purple-400'
                                : 'border-transparent text-gray-400 hover:text-theme-purple-300 hover:border-theme-purple-300'
                            }`}
                        >
                            Social Media
                        </button>
                        <button
                            onClick={() => setActiveTab('role-info')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'role-info'
                                ? 'border-theme-purple-500 text-theme-purple-400'
                                : 'border-transparent text-gray-400 hover:text-theme-purple-300 hover:border-theme-purple-300'
                            }`}
                        >
                            {formData.role === 'Journalist' ? 'Journalist Info' : 'Owner Info'}
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'security'
                                ? 'border-theme-purple-500 text-theme-purple-400'
                                : 'border-transparent text-gray-400 hover:text-theme-purple-300 hover:border-theme-purple-300'
                            }`}
                        >
                            Security
                        </button>
                    </nav>
                </div>

                {/* Success and Error Messages */}
                {updateSuccess && (
                    <div className="mb-6 p-4 bg-green-900 bg-opacity-30 border border-green-700 text-green-400 rounded animate-fadeIn">
                        {updateSuccess}
                    </div>
                )}
                
                {error && (
                    <div className="mb-6 p-4 bg-red-900 bg-opacity-30 border border-red-700 text-red-400 rounded animate-fadeIn">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 profile-form">
                    {/* Basic Profile Info Tab */}
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="name" className={labelStyle}>
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`${inputFieldStyle} ${placeholderStyle}`}
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="email" className={labelStyle}>
                                        Email (Cannot be changed)
                                    </label>                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        disabled
                                        className="w-full px-3 py-2 rounded-md bg-gray-200 border-theme-purple-600 text-gray-700 shadow-sm"
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="phone" className={labelStyle}>
                                        Phone
                                    </label>
                                    <input
                                        type="text"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className={`${inputFieldStyle} ${placeholderStyle}`}
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="location" className={labelStyle}>
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        id="location"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="City, State, Country"
                                        className={`${inputFieldStyle} ${placeholderStyle}`}
                                    />
                                </div>
                                
                                <div className="md:col-span-2">
                                    <label htmlFor="bio" className={labelStyle}>
                                        Bio
                                    </label>
                                    <textarea
                                        id="bio"
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        rows="4"
                                        placeholder="Tell others about yourself..."
                                        className="w-full px-3 py-2 rounded-md bg-theme-black-800 border-theme-purple-600 text-black shadow-sm focus:border-theme-purple-500 focus:ring-theme-purple-500"
                                    ></textarea>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-theme-purple-300 mb-1">
                                    Profile Image
                                </label>
                                <div className="mt-1 flex items-center space-x-4">
                                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-theme-purple-600">
                                        <img 
                                            src={formData.profileImage || "https://via.placeholder.com/150?text=Profile"} 
                                            alt="Profile preview"
                                            className="w-full h-full object-cover" 
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current.click()}
                                            className="px-4 py-2 bg-theme-black-800 hover:bg-theme-black-700 text-theme-purple-300 rounded border border-theme-purple-600 transition-colors"
                                        >
                                            {formData.profileImage ? 'Change Image' : 'Upload Image'}
                                        </button>
                                        {formData.profileImage && (
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, profileImage: '' }))}
                                                className="ml-2 px-4 py-2 bg-red-900 hover:bg-red-800 text-red-300 rounded border border-red-700 transition-colors"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <p className="mt-2 text-sm text-theme-purple-400">
                                    Recommended: Square image, at least 300x300 pixels
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Social Media Tab */}
                    {activeTab === 'social' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="socialMedia.youtube" className={labelStyle}>
                                        YouTube
                                    </label>
                                    <div className="flex rounded-md shadow-sm">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-theme-purple-600 bg-theme-black-900 text-theme-purple-400">
                                            <i className="fab fa-youtube"></i>
                                        </span>
                                        <input
                                            type="url"
                                            id="socialMedia.youtube"
                                            name="socialMedia.youtube"
                                            value={formData.socialMedia.youtube}
                                            onChange={handleChange}
                                            placeholder="https://youtube.com/channel/..."
                                            className={`${inputFieldStyle} ${placeholderStyle}`}
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label htmlFor="socialMedia.instagram" className={labelStyle}>
                                        Instagram
                                    </label>
                                    <div className="flex rounded-md shadow-sm">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-theme-purple-600 bg-theme-black-900 text-theme-purple-400">
                                            <i className="fab fa-instagram"></i>
                                        </span>
                                        <input
                                            type="url"
                                            id="socialMedia.instagram"
                                            name="socialMedia.instagram"
                                            value={formData.socialMedia.instagram}
                                            onChange={handleChange}
                                            placeholder="https://instagram.com/..."
                                            className={`${inputFieldStyle} ${placeholderStyle}`}
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label htmlFor="socialMedia.twitter" className={labelStyle}>
                                        Twitter
                                    </label>
                                    <div className="flex rounded-md shadow-sm">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-theme-purple-600 bg-theme-black-900 text-theme-purple-400">
                                            <i className="fab fa-twitter"></i>
                                        </span>
                                        <input
                                            type="url"
                                            id="socialMedia.twitter"
                                            name="socialMedia.twitter"
                                            value={formData.socialMedia.twitter}
                                            onChange={handleChange}
                                            placeholder="https://twitter.com/..."
                                            className={`${inputFieldStyle} ${placeholderStyle}`}
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label htmlFor="socialMedia.linkedin" className={labelStyle}>
                                        LinkedIn
                                    </label>
                                    <div className="flex rounded-md shadow-sm">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-theme-purple-600 bg-theme-black-900 text-theme-purple-400">
                                            <i className="fab fa-linkedin"></i>
                                        </span>
                                        <input
                                            type="url"
                                            id="socialMedia.linkedin"
                                            name="socialMedia.linkedin"
                                            value={formData.socialMedia.linkedin}
                                            onChange={handleChange}
                                            placeholder="https://linkedin.com/in/..."
                                            className={`${inputFieldStyle} ${placeholderStyle}`}
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label htmlFor="socialMedia.website" className={labelStyle}>
                                        Website
                                    </label>
                                    <div className="flex rounded-md shadow-sm">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-theme-purple-600 bg-theme-black-900 text-theme-purple-400">
                                            <i className="fas fa-globe"></i>
                                        </span>
                                        <input
                                            type="url"
                                            id="socialMedia.website"
                                            name="socialMedia.website"
                                            value={formData.socialMedia.website}
                                            onChange={handleChange}
                                            placeholder="https://yourwebsite.com"
                                            className={`${inputFieldStyle} ${placeholderStyle}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Role-Specific Info Tab */}
                    {activeTab === 'role-info' && (
                        <div className="space-y-6">
                            {formData.role === 'Journalist' ? (
                                // Journalist Info
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <p className="text-theme-purple-400 mb-4">
                                            <i className="fas fa-info-circle mr-2"></i>
                                            As a Journalist, you can provide information about your professional background.
                                        </p>
                                    </div>
                                    <div>
                                        <label htmlFor="journalistInfo.publication" className={labelStyle}>
                                            Publication/Media House
                                        </label>
                                        <input
                                            type="text"
                                            id="journalistInfo.publication"
                                            name="journalistInfo.publication"
                                            value={formData.journalistInfo?.publication || ''}
                                            onChange={handleChange}
                                            placeholder="e.g., AutoCar India, Car & Bike, etc."
                                            className={`${inputFieldStyle} ${placeholderStyle}`}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="journalistInfo.experience" className={labelStyle}>
                                            Years of Experience
                                        </label>
                                        <input
                                            type="number"
                                            id="journalistInfo.experience"
                                            name="journalistInfo.experience"
                                            value={formData.journalistInfo?.experience || 0}
                                            onChange={handleChange}
                                            min="0"
                                            max="100"
                                            className={`${inputFieldStyle} ${placeholderStyle}`}
                                        />
                                    </div>
                                    
                                    <div className="md:col-span-2">
                                        <label htmlFor="journalistInfo.specialization" className={labelStyle}>
                                            Specialization/Areas of Focus
                                        </label>
                                        <input
                                            type="text"
                                            id="journalistInfo.specialization"
                                            name="journalistInfo.specialization"
                                            value={formData.journalistInfo?.specialization || ''}
                                            onChange={handleChange}
                                            placeholder="e.g., Performance Cars, EV Trends, Classic Cars, etc."
                                            className={`${inputFieldStyle} ${placeholderStyle}`}
                                        />
                                    </div>
                                </div>
                            ) : formData.role === 'Car Owner' ? (
                                // Car Owner Info
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <p className="text-theme-purple-400 mb-4">
                                            <i className="fas fa-info-circle mr-2"></i>
                                            As a Car Owner, you can provide details that will help journalists reach you.
                                        </p>
                                    </div>
                                    <div>
                                        <label htmlFor="ownerInfo.businessName" className={labelStyle}>
                                            Business Name (if applicable)
                                        </label>
                                        <input
                                            type="text"
                                            id="ownerInfo.businessName"
                                            name="ownerInfo.businessName"
                                            value={formData.ownerInfo?.businessName || ''}
                                            onChange={handleChange}
                                            placeholder="e.g., Vintage Motors, PremiumDrives, etc."
                                            className={`${inputFieldStyle} ${placeholderStyle}`}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="ownerInfo.preferredContactMethod" className={labelStyle}>
                                            Preferred Contact Method
                                        </label>
                                        <select
                                            id="ownerInfo.preferredContactMethod"
                                            name="ownerInfo.preferredContactMethod"
                                            value={formData.ownerInfo?.preferredContactMethod || 'email'}
                                            onChange={handleChange}
                                            className={selectFieldStyle}
                                        >
                                            <option value="email">Email</option>
                                            <option value="phone">Phone</option>
                                            <option value="both">Both Email & Phone</option>
                                        </select>
                                    </div>
                                </div>
                            ) : (
                                // Fallback for unknown role
                                <div className="bg-theme-black-900 bg-opacity-60 border border-theme-purple-700 p-4 rounded-md">
                                    <p className="text-theme-purple-300">Role-specific information is not available for your account type.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="password" className={labelStyle}>
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Leave blank to keep current password"
                                        className="w-full px-3 py-2 rounded-md bg-theme-black-800 border-theme-purple-600 text-black shadow-sm focus:border-theme-purple-500 focus:ring-theme-purple-500"
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="confirmPassword" className={labelStyle}>
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Confirm new password"
                                        className="w-full px-3 py-2 rounded-md bg-theme-black-800 border-theme-purple-600 text-black shadow-sm focus:border-theme-purple-500 focus:ring-theme-purple-500"
                                    />
                                </div>
                            </div>
                            
                            <div className="mt-2 text-sm text-theme-purple-400">
                                <p>Password must be at least 6 characters long.</p>
                            </div>
                        </div>
                    )}

                    {/* Update Profile Button - Always Visible */}
                    <div className="flex justify-end pt-6 border-t border-theme-purple-800">
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
            {/* Global styles to ensure proper form field visibility */}
            <style jsx global>{`
                .profile-page input,
                .profile-page textarea,
                .profile-page select {
                    background-color: white !important;
                    color: black !important;
                    border: 1px solid #7c3aed !important;
                }
                
                .profile-page input::placeholder,
                .profile-page textarea::placeholder,
                .profile-page select::placeholder {
                    color: #6b7280 !important;
                    opacity: 1;
                }
                
                /* Style for select options to ensure they're visible */
                .profile-page select option {
                    background-color: white !important;
                    color: black !important;
                }
            `}</style>
        </div>
    );
};

export default UserProfilePage;