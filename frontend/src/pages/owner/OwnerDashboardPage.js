// frontend/src/pages/owner/OwnerDashboardPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchCarsByOwner, updateCarAvailability } from '../../services/carService';
import { fetchIncomingRequests, updateRequestStatus } from '../../services/requestService';
import UserProfileModal from '../../components/users/UserProfileModal';

const OwnerDashboardPage = () => {
  // eslint-disable-next-line no-unused-vars
  const { userInfo } = useAuth();
  const [loading, setLoading] = useState(true);
  const [cars, setCars] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('cars');
  const [stats, setStats] = useState({
    totalCars: 0,
    activeCars: 0,
    totalRequests: 0,
    pendingRequests: 0,
  });
  const [error, setError] = useState('');
  
  // User profile modal state
  const [profileModal, setProfileModal] = useState({
    isOpen: false,
    userId: null
  });
  
  // Open profile modal
  const openProfileModal = (userId) => {
    setProfileModal({
      isOpen: true,
      userId
    });
  };
  
  // Close profile modal
  const closeProfileModal = () => {
    setProfileModal({
      isOpen: false,
      userId: null
    });
  };

  // Fetch owner's cars and requests
  useEffect(() => {
    const fetchOwnerData = async () => {
      setLoading(true);
      try {
        // Fetch cars owned by the current user
        const carsData = await fetchCarsByOwner();
        setCars(carsData);
        
        // Fetch incoming test drive requests
        const requestsData = await fetchIncomingRequests();
        setRequests(requestsData);
        
        // Calculate statistics
        const activeCars = carsData.filter(car => car.isAvailable).length;
        const pendingRequests = requestsData.filter(req => req.status === 'Pending').length;
        
        setStats({
          totalCars: carsData.length,
          activeCars,
          totalRequests: requestsData.length,
          pendingRequests,
        });
        
        setError('');
      } catch (err) {
        console.error('Error fetching owner data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerData();
  }, []);  // Handle request status update (Approve/Reject/Complete)
  const handleRequestUpdate = async (requestId, newStatus, ownerResponse = '') => {
    try {
      await updateRequestStatus(requestId, newStatus, ownerResponse);
      
      // Find the current request and get its status before updating
      const requestToUpdate = requests.find(req => req._id === requestId);
      const isPendingRequest = requestToUpdate && requestToUpdate.status === 'Pending';
      
      // Update local state to reflect the change
      setRequests(prevRequests => 
        prevRequests.map(req => 
          req._id === requestId ? { ...req, status: newStatus, ownerResponse } : req
        )
      );
      
      // Only decrement the pending count if the request was actually in pending status
      if (isPendingRequest) {
        setStats(prevStats => ({
          ...prevStats,
          pendingRequests: prevStats.pendingRequests - 1
        }));
      }
    } catch (err) {
      console.error(`Error ${newStatus.toLowerCase()}ing request:`, err);
      setError(`Failed to ${newStatus.toLowerCase()} request. Please try again.`);
    }
  };
  // Toggle car availability
  const toggleCarAvailability = async (carId, currentStatus) => {
    try {
      await updateCarAvailability(carId, !currentStatus);
      
      // Update local state
      setCars(prevCars => 
        prevCars.map(car => 
          car._id === carId ? { ...car, isAvailable: !currentStatus } : car
        )
      );
      
      // Update active cars count
      setStats(prevStats => ({
        ...prevStats,
        activeCars: currentStatus 
          ? prevStats.activeCars - 1 
          : prevStats.activeCars + 1
      }));
    } catch (err) {
      console.error('Error toggling car availability:', err);
      setError('Failed to update car availability. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-theme-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-theme-black-900 bg-opacity-80 rounded-lg shadow-purple-glow p-6 border border-theme-purple-700 backdrop-blur-sm">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-purple-gradient mb-6">Owner Dashboard</h1>
        
        {error && (
          <div className="bg-red-900 bg-opacity-30 border border-red-700 text-red-400 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
          {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-theme-black-850 rounded-lg p-6 shadow-purple-glow border-2 border-theme-purple-700 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-theme-purple-300">Total Cars</h3>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-theme-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            </div>
            <p className="text-4xl font-bold text-theme-purple-200">{stats.totalCars}</p>
          </div>
          <div className="bg-theme-black-850 rounded-lg p-6 shadow-purple-glow border-2 border-green-700 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-green-400">Active Listings</h3>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-4xl font-bold text-green-300">{stats.activeCars}</p>
          </div>
          <div className="bg-theme-black-850 rounded-lg p-6 shadow-purple-glow border-2 border-theme-purple-700 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-theme-purple-300">Total Requests</h3>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-theme-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-4xl font-bold text-theme-purple-200">{stats.totalRequests}</p>
          </div>
          <div className="bg-theme-black-850 rounded-lg p-6 shadow-purple-glow border-2 border-yellow-600 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-yellow-300">Pending Requests</h3>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-4xl font-bold text-yellow-300">{stats.pendingRequests}</p>
          </div>
        </div>
          {/* Tab Navigation */}
        <div className="border-b-2 border-theme-purple-700 mb-8">
          <nav className="flex space-x-12">
            <button
              onClick={() => setActiveTab('cars')}
              className={`py-4 px-4 border-b-2 font-medium text-md transition-all duration-300 ${
                activeTab === 'cars'
                  ? 'border-theme-purple-500 text-theme-purple-200 font-semibold'
                  : 'border-transparent text-gray-400 hover:text-theme-purple-300 hover:border-theme-purple-300'
              }`}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
                My Cars
              </div>
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-4 px-4 border-b-2 font-medium text-md transition-all duration-300 ${
                activeTab === 'requests'
                  ? 'border-theme-purple-500 text-theme-purple-200 font-semibold'
                  : 'border-transparent text-gray-400 hover:text-theme-purple-300 hover:border-theme-purple-300'
              }`}
            >              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Test Drive Requests
                {stats.pendingRequests > 0 && activeTab !== 'requests' && (
                  <span className="ml-2 bg-yellow-500 text-dark font-bold text-xs px-2 py-0.5 rounded-full">
                    {stats.pendingRequests}
                  </span>
                )}
              </div>
            </button>
          </nav>
        </div>
        
        {/* My Cars Tab */}
        {activeTab === 'cars' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-theme-purple-300">My Cars</h2>
              <Link
                to="/cars/new"
                className="gradient-button text-white font-medium py-2 px-4 rounded shadow-purple-glow transform hover:scale-105 transition duration-300"
              >
                Add New Car
              </Link>
            </div>
            
            {cars.length === 0 ? (
              <div className="text-center py-8 bg-theme-black-800 rounded-lg border border-theme-purple-700">
                <p className="text-gray-300 mb-4">You haven't listed any cars yet.</p>
                <Link
                  to="/cars/new"
                  className="gradient-button text-white font-medium py-2 px-4 rounded shadow-purple-glow transform hover:scale-105 transition duration-300"
                >
                  List Your First Car
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-theme-black-800 rounded-lg border border-theme-purple-700 shadow-purple-glow">
                  <thead className="bg-theme-black-950">
                    <tr>
                      <th className="py-3 px-4 text-left text-theme-purple-300">Image</th>
                      <th className="py-3 px-4 text-left text-theme-purple-300">Details</th>
                      <th className="py-3 px-4 text-left text-theme-purple-300">Price</th>
                      <th className="py-3 px-4 text-left text-theme-purple-300">Status</th>
                      <th className="py-3 px-4 text-left text-theme-purple-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-theme-purple-900">
                    {cars.map(car => (
                      <tr key={car._id} className="hover:bg-theme-black-700 transition duration-150">                        <td className="py-4 px-4">
                          <img
                            src={car.image 
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
                                  : 'https://via.placeholder.com/100x70.png?text=No+Image')}
                            alt={`${car.make} ${car.model}`}
                            className="w-24 h-16 object-cover rounded border border-theme-purple-700"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/100x70.png?text=No+Image';
                            }}
                          />
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-medium text-theme-purple-300">{car.year} {car.make} {car.model}</p>
                          <p className="text-gray-400 text-sm">{car.location}</p>
                        </td>
                        <td className="py-4 px-4 text-theme-purple-300">₹{car.price}/day</td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            car.isAvailable
                              ? 'bg-green-900 bg-opacity-40 text-green-400 border border-green-700'
                              : 'bg-red-900 bg-opacity-40 text-red-400 border border-red-700'
                          }`}>
                            {car.isAvailable ? 'Available' : 'Not Available'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            <Link
                              to={`/cars/${car._id}`}
                              className="px-2 py-1 bg-theme-black-700 hover:bg-theme-black-600 text-theme-purple-300 rounded text-sm transition duration-300 border border-theme-purple-700"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => toggleCarAvailability(car._id, car.isAvailable)}
                              className={`px-2 py-1 rounded text-sm transition duration-300 ${
                                car.isAvailable
                                  ? 'bg-red-900 bg-opacity-40 hover:bg-red-900 hover:bg-opacity-70 text-red-400 border border-red-700'
                                  : 'bg-green-900 bg-opacity-40 hover:bg-green-900 hover:bg-opacity-70 text-green-400 border border-green-700'
                              }`}
                            >
                              {car.isAvailable ? 'Set Unavailable' : 'Set Available'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
          {/* Test Drive Requests Tab */}
        {activeTab === 'requests' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-purple-gradient">Test Drive Requests</h2>
            </div>
            
            {requests.length === 0 ? (
              <div className="text-center py-16 bg-theme-black-800 rounded-lg shadow-purple-glow border-2 border-theme-purple-600 backdrop-blur-sm animate-pulse-slow">
                <div className="mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-theme-purple-400 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <p className="text-theme-purple-200 mb-4 text-xl font-semibold">You don't have any test drive requests yet.</p>
                <p className="text-theme-purple-400 max-w-lg mx-auto">Your test drive requests will appear here once journalists express interest in your cars.</p>
              </div>
            ) : (
              <div className="overflow-x-auto bg-theme-black-800 rounded-lg border-2 border-theme-purple-600 shadow-purple-glow">
                <table className="min-w-full">
                  <thead className="bg-theme-black-900 border-b-2 border-theme-purple-700">
                    <tr>
                      <th className="py-5 px-6 text-left text-theme-purple-300 font-semibold text-lg">Journalist</th>
                      <th className="py-5 px-6 text-left text-theme-purple-300 font-semibold text-lg">Car</th>
                      <th className="py-5 px-6 text-left text-theme-purple-300 font-semibold text-lg">Requested Date</th>
                      <th className="py-5 px-6 text-left text-theme-purple-300 font-semibold text-lg">Status</th>
                      <th className="py-5 px-6 text-left text-theme-purple-300 font-semibold text-lg">Message</th>
                      <th className="py-5 px-6 text-left text-theme-purple-300 font-semibold text-lg">Actions</th>
                    </tr>
                  </thead>                  <tbody className="divide-y-2 divide-theme-purple-800">
                    {requests.map(request => (
                      <tr key={request._id} className="hover:bg-theme-black-850 transition-colors duration-150">                        <td className="py-5 px-6">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-theme-purple-700 flex items-center justify-center mr-3 text-white font-medium border border-theme-purple-500">
                              {request.journalist?.name?.charAt(0) || '?'}
                            </div>
                            <button 
                              onClick={() => openProfileModal(request.journalist?._id)}
                              className="text-theme-purple-100 font-medium hover:text-theme-purple-300 transition-colors"
                            >
                              {request.journalist?.name || 'Unknown'}
                            </button>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          {request.car ? (
                            <div className="flex items-center">                              <div className="relative h-16 w-24 overflow-hidden rounded-md mr-4 border-2 border-theme-purple-600 shadow-sm">
                                <img 
                                  src={request.car.image 
                                    ? (request.car.image.startsWith('http') 
                                        ? request.car.image 
                                        : `http://localhost:5000${request.car.image.startsWith('/uploads') 
                                            ? request.car.image 
                                            : `/uploads/${request.car.image}`}`) 
                                    : (request.car.images && request.car.images.length > 0 
                                        ? (request.car.images[0].startsWith('http')
                                            ? request.car.images[0]
                                            : `http://localhost:5000${request.car.images[0].startsWith('/uploads')
                                                ? request.car.images[0]
                                                : `/uploads/${request.car.images[0]}`}`)
                                        : 'https://via.placeholder.com/96x64.png?text=No+Image')}
                                  alt={`${request.car.make} ${request.car.model}`}
                                  className="h-full w-full object-cover hover:scale-110 transition-transform duration-500" 
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/96x64.png?text=No+Image';
                                  }}
                                />
                              </div>
                              <div>
                                <span className="text-theme-purple-100 font-semibold hover:text-theme-purple-200 transition-colors block">
                                  {request.car.make} {request.car.model}
                                </span>
                                <span className="text-theme-purple-400 text-sm block mt-1">
                                  {request.car.year}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500 italic">Unknown Car</span>
                          )}
                        </td>
                        <td className="py-5 px-6">
                          <div className="text-theme-purple-200">
                            {request.requestedDateTime 
                              ? new Date(request.requestedDateTime).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })
                              : 'Not specified'}
                            <span className="block text-theme-purple-400 text-sm mt-1">
                              {request.requestedDateTime 
                                ? new Date(request.requestedDateTime).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : ''}
                            </span>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <span className={`px-4 py-2 rounded-full text-sm font-medium inline-flex items-center ${
                            request.status === 'Pending' ? 'bg-yellow-900 bg-opacity-30 text-yellow-300 border-2 border-yellow-600' :
                            request.status === 'Approved' ? 'bg-green-900 bg-opacity-30 text-green-300 border-2 border-green-600' :
                            request.status === 'Rejected' ? 'bg-red-900 bg-opacity-30 text-red-300 border-2 border-red-600' :
                            'bg-blue-900 bg-opacity-30 text-blue-300 border-2 border-blue-600'
                          }`}>
                            {request.status === 'Pending' && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                            {request.status === 'Approved' && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            {request.status === 'Rejected' && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                            {request.status === 'Completed' && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                            {request.status}
                          </span>
                        </td>                        <td className="py-5 px-6">
                          {request.message ? (
                            <div className="relative group">
                              <div className="flex items-center">
                                <div className="max-w-[200px] text-theme-purple-200 truncate">
                                  {request.message}
                                </div>
                                <span className="ml-2 text-xs text-theme-purple-400">(hover to read)</span>
                              </div>
                              <div className="absolute left-0 top-0 mt-8 bg-theme-black-900 border-2 border-theme-purple-600 p-4 rounded-lg shadow-purple-glow z-20 w-80 hidden group-hover:block">
                                <div className="text-theme-purple-100 whitespace-normal">{request.message}</div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500 italic">No message</span>
                          )}
                        </td>                        <td className="py-5 px-6">
                          {request.status === 'Pending' && (
                            <div className="flex space-x-3">
                              <button 
                                onClick={() => handleRequestUpdate(request._id, 'Approved')}
                                className="px-4 py-2 bg-green-900 bg-opacity-30 border-2 border-green-600 rounded-full text-green-300 hover:bg-green-800 hover:bg-opacity-50 transition-all duration-300 flex items-center"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Approve
                              </button>
                              <button 
                                onClick={() => handleRequestUpdate(request._id, 'Rejected')}
                                className="px-4 py-2 bg-red-900 bg-opacity-30 border-2 border-red-600 rounded-full text-red-300 hover:bg-red-800 hover:bg-opacity-50 transition-all duration-300 flex items-center"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Reject
                              </button>
                            </div>
                          )}
                          {request.status === 'Approved' && (
                            <button 
                              onClick={() => handleRequestUpdate(request._id, 'Completed')}
                              className="px-4 py-2 bg-blue-900 bg-opacity-30 border-2 border-blue-600 rounded-full text-blue-300 hover:bg-blue-800 hover:bg-opacity-50 transition-all duration-300 flex items-center"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Mark Completed
                            </button>
                          )}
                          {request.status === 'Rejected' && (
                            <span className="text-gray-500 italic">No actions available</span>
                          )}
                          {request.status === 'Completed' && (
                            <span className="text-theme-purple-400 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Test drive completed
                            </span>                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        
        {/* User Profile Modal */}
        <UserProfileModal 
          isOpen={profileModal.isOpen} 
          onClose={closeProfileModal}
          userId={profileModal.userId}
        />
      </div>
    </div>
  );
};

export default OwnerDashboardPage;
