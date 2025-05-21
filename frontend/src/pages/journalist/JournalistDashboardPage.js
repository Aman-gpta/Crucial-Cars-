// frontend/src/pages/journalist/JournalistDashboardPage.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchCars } from '../../services/carService';
import { fetchOutgoingRequests, createTestDriveRequest, withdrawTestDriveRequest } from '../../services/requestService';
import UserProfileModal from '../../components/users/UserProfileModal';

const JournalistDashboardPage = () => {
  // eslint-disable-next-line no-unused-vars
  const { userInfo } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [availableCars, setAvailableCars] = useState([]);
  const [activeTab, setActiveTab] = useState('requests');
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0
  });

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
  // New request form state
  // eslint-disable-next-line no-unused-vars
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedCar, setSelectedCar] = useState('');  const [requestMessage, setRequestMessage] = useState('');
  const [requestDate, setRequestDate] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  // State for selected car details (when coming from car details page)
  // eslint-disable-next-line no-unused-vars
  const [selectedCarDetails, setSelectedCarDetails] = useState(null);
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    requestId: null,
    message: ''
  });

  // Handle car selection when redirected from car details page
  useEffect(() => {
    if (location.state) {
      // If we have car selection information in the location state
      if (location.state.activeTab === 'new') {
        setActiveTab('new');
        setShowRequestForm(true);
        
        if (location.state.selectedCarId) {
          // Set the selected car ID in the form
          setSelectedCar(location.state.selectedCarId);
        }
        
        if (location.state.carDetails) {
          // Set car details for display
          setSelectedCarDetails(location.state.carDetails);
        }
      }
    }
  }, [location.state]);

  // Fetch journalist data
  useEffect(() => {
    const fetchJournalistData = async () => {
      setLoading(true);
      try {
        // Fetch outgoing test drive requests
        const requestsData = await fetchOutgoingRequests();
        setRequests(requestsData);
        
        // Fetch available cars for test drive
        const carsData = await fetchCars({ isAvailable: true });
        setAvailableCars(carsData);
        
        // Calculate statistics
        const pendingRequests = requestsData.filter(req => req.status === 'Pending').length;
        const approvedRequests = requestsData.filter(req => req.status === 'Approved').length;
        const rejectedRequests = requestsData.filter(req => req.status === 'Rejected').length;
        
        setStats({
          totalRequests: requestsData.length,
          pendingRequests,
          approvedRequests,
          rejectedRequests
        });
        
        setError('');
      } catch (err) {
        console.error('Error fetching journalist data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchJournalistData();
  }, []);

  // Handle form submission for new test drive request
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    
    if (!selectedCar) {
      setFormError('Please select a car for the test drive.');
      return;
    }
    
    try {      // Ensure we always use 12:00 PM for the test drive time
      let formattedDateTime = undefined;
      if (requestDate) {
        // If the date is already selected, ensure the time is set to 12:00 PM
        const datePart = requestDate.split('T')[0];
        formattedDateTime = `${datePart}T12:00`;
      }

      const requestData = {
        carId: selectedCar,
        message: requestMessage,
        requestedDateTime: formattedDateTime
      };
      
      await createTestDriveRequest(requestData);
      
      // Reset form
      setSelectedCar('');
      setRequestMessage('');
      setRequestDate('');
      setFormSuccess('Test drive request submitted successfully!');
      setShowRequestForm(false);
      
      // Refresh the requests list
      const updatedRequests = await fetchOutgoingRequests();
      setRequests(updatedRequests);
      
      // Update stats
      const pendingRequests = updatedRequests.filter(req => req.status === 'Pending').length;
      const approvedRequests = updatedRequests.filter(req => req.status === 'Approved').length;
      const rejectedRequests = updatedRequests.filter(req => req.status === 'Rejected').length;
      
      setStats({
        totalRequests: updatedRequests.length,
        pendingRequests,
        approvedRequests,
        rejectedRequests
      });
    } catch (err) {
      console.error('Error creating test drive request:', err);
      setFormError(err.response?.data?.message || 'Failed to submit request. Please try again.');
    }
  };  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    
    const date = new Date(dateString);
    
    // Get the current date
    const requestDate = date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    // For consistency, we'll always show 12:00 PM as the start time
    // The end time is always 10:00 AM the next day
    return `${requestDate}, 12:00 PM - 10:00 AM next day`;
  };
  // Handle withdrawing a test drive request
  const handleWithdrawRequest = async (requestId) => {
    if (!requestId) {
      setError('Invalid request ID. Cannot withdraw.');
      return;
    }

    // Open confirmation dialog instead of using global confirm
    setConfirmDialog({
      open: true,
      requestId: requestId,
      message: 'Are you sure you want to withdraw this test drive request?'
    });
  };

  // Actual withdrawal function to be called after confirmation
  const confirmWithdrawal = async (requestId) => {
    setLoading(true);
    try {
      const result = await withdrawTestDriveRequest(requestId);
      
      // Show success message
      setFormSuccess(result.message || 'Test drive request withdrawn successfully');
      
      // Refresh requests list
      const updatedRequests = await fetchOutgoingRequests();
      setRequests(updatedRequests);
      
      // Update statistics
      const pendingRequests = updatedRequests.filter(req => req.status === 'Pending').length;
      const approvedRequests = updatedRequests.filter(req => req.status === 'Approved').length;
      const rejectedRequests = updatedRequests.filter(req => req.status === 'Rejected').length;
      
      setStats({
        totalRequests: updatedRequests.length,
        pendingRequests,
        approvedRequests,
        rejectedRequests
      });
    } catch (err) {
      console.error('Error withdrawing test drive request:', err);
      setError(err.message || 'Failed to withdraw test drive request. Please try again.');
    } finally {
      setLoading(false);
      // Close the confirmation dialog
      setConfirmDialog({ open: false, requestId: null, message: '' });
    }
  };
  // Get status badge class
  // eslint-disable-next-line no-unused-vars
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-purple-gradient mb-6">Journalist Dashboard</h1>
        
        {error && (
          <div className="bg-red-900 bg-opacity-30 border border-red-700 text-red-400 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {formSuccess && (
          <div className="bg-green-900 bg-opacity-30 border border-green-700 text-green-400 px-4 py-3 rounded mb-4">
            {formSuccess}
          </div>
        )}
          {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-theme-black-850 rounded-lg p-5 shadow-purple-glow border-2 border-theme-purple-700 transform hover:scale-105 transition-all duration-300">
            <h3 className="text-lg font-semibold text-theme-purple-400 mb-2">Total Requests</h3>
            <p className="text-4xl font-bold text-theme-purple-200">{stats.totalRequests}</p>
          </div>
          <div className="bg-theme-black-850 rounded-lg p-5 shadow-purple-glow border-2 border-yellow-700 transform hover:scale-105 transition-all duration-300">
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">Pending</h3>
            <p className="text-4xl font-bold text-yellow-300">{stats.pendingRequests}</p>
          </div>
          <div className="bg-theme-black-850 rounded-lg p-5 shadow-purple-glow border-2 border-green-700 transform hover:scale-105 transition-all duration-300">
            <h3 className="text-lg font-semibold text-green-400 mb-2">Approved</h3>
            <p className="text-4xl font-bold text-green-300">{stats.approvedRequests}</p>
          </div>
          <div className="bg-theme-black-850 rounded-lg p-5 shadow-purple-glow border-2 border-red-700 transform hover:scale-105 transition-all duration-300">
            <h3 className="text-lg font-semibold text-red-400 mb-2">Rejected</h3>
            <p className="text-4xl font-bold text-red-300">{stats.rejectedRequests}</p>
          </div>
        </div>
          {/* Tab Navigation */}
        <div className="border-b-2 border-theme-purple-700 mb-8">
          <nav className="flex space-x-12">
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-4 px-4 border-b-2 font-medium text-md transition-all duration-300 ${
                activeTab === 'requests'
                  ? 'border-theme-purple-500 text-theme-purple-200 font-semibold'
                  : 'border-transparent text-gray-400 hover:text-theme-purple-300 hover:border-theme-purple-300'
              }`}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                My Test Drive Requests
              </div>
            </button>
            <button
              onClick={() => {setActiveTab('new'); setShowRequestForm(true);}}
              className={`py-4 px-4 border-b-2 font-medium text-md transition-all duration-300 ${
                activeTab === 'new'
                  ? 'border-theme-purple-500 text-theme-purple-200 font-semibold'
                  : 'border-transparent text-gray-400 hover:text-theme-purple-300 hover:border-theme-purple-300'
              }`}
            >
              <div className="flex items-center">                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>                Request New Test Drive
              </div>
            </button>
          </nav>
        </div>
          {/* My Requests Tab */}
        {activeTab === 'requests' && (
          <div>            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-purple-gradient">My Test Drive Requests</h2>
              <button
                onClick={() => setActiveTab('new')}
                className="gradient-button px-6 py-2.5 rounded-full text-white font-medium shadow-purple-glow hover:shadow-purple-neon transform hover:scale-105 transition-all duration-300"
              >
                Request New Test Drive
              </button>
            </div>
            
            {requests.length === 0 ? (
              <div className="text-center py-16 bg-theme-black-800 rounded-lg shadow-purple-glow border-2 border-theme-purple-600 backdrop-blur-sm animate-pulse-slow">
                <div className="mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-theme-purple-400 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <p className="text-theme-purple-200 mb-6 text-xl font-semibold">You haven't made any test drive requests yet.</p>
                <p className="text-theme-purple-400 mb-8 max-w-lg mx-auto">Start by requesting a test drive from our available car selection.</p>
                <button
                  onClick={() => setActiveTab('new')}
                  className="gradient-button px-8 py-3 rounded-full text-white font-medium shadow-purple-glow hover:shadow-purple-neon transform hover:scale-105 transition-all duration-300"
                >
                  Request Your First Test Drive
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto bg-theme-black-800 rounded-lg border-2 border-theme-purple-600 shadow-purple-glow">
                <table className="min-w-full">
                  <thead className="bg-theme-black-900 border-b-2 border-theme-purple-700">
                    <tr>
                      <th className="py-5 px-6 text-left text-theme-purple-300 font-semibold text-lg">Car</th>                      <th className="py-5 px-6 text-left text-theme-purple-300 font-semibold text-lg">Owner</th>
                      <th className="py-5 px-6 text-left text-theme-purple-300 font-semibold text-lg">Requested Date</th>
                      <th className="py-5 px-6 text-left text-theme-purple-300 font-semibold text-lg">Status</th>
                      <th className="py-5 px-6 text-left text-theme-purple-300 font-semibold text-lg">Owner Response</th>
                      <th className="py-5 px-6 text-left text-theme-purple-300 font-semibold text-lg">Actions</th>
                    </tr>
                  </thead>                  <tbody className="divide-y-2 divide-theme-purple-800">
                    {requests.map(request => (
                      <tr key={request._id} className="hover:bg-theme-black-850 transition-colors duration-150">
                        <td className="py-5 px-6 font-medium text-white">
                          {request.car ? (
                            <div className="flex items-center">
                              {request.car.image && (
                                <div className="relative h-16 w-24 overflow-hidden rounded-md mr-4 border-2 border-theme-purple-600 shadow-sm">
                                  <img 
                                    src={request.car.image.startsWith('http') 
                                      ? request.car.image 
                                      : request.car.image.startsWith('/uploads/')
                                        ? `http://localhost:5000${request.car.image}`
                                        : `http://localhost:5000/uploads/${request.car.image}`
                                    } 
                                    alt={`${request.car.make} ${request.car.model}`}
                                    className="h-full w-full object-cover hover:scale-110 transition-transform duration-500" 
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = 'https://via.placeholder.com/96x64.png?text=No+Image';
                                    }}
                                  />
                                </div>
                              )}
                              <div>
                                <span className="text-theme-purple-100 font-semibold hover:text-theme-purple-200 transition-colors block">
                                  {request.car.make} {request.car.model}
                                </span>
                                <span className="text-theme-purple-400 text-sm block mt-1">
                                  {request.car.year} • {request.car.color}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500 italic">Unknown Car</span>
                          )}
                        </td>                        <td className="py-5 px-6">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-theme-purple-700 flex items-center justify-center mr-3 text-white font-medium border border-theme-purple-500">
                              {request.owner?.name?.charAt(0) || '?'}
                            </div>
                            <button
                              onClick={() => openProfileModal(request.owner?._id)}
                              className="text-theme-purple-100 font-medium hover:text-theme-purple-300 transition-colors"
                            >
                              {request.owner?.name || 'Unknown Owner'}
                            </button>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <div className="text-theme-purple-200">
                            {formatDate(request.requestedDateTime).split(',')[0]}
                            <span className="block text-theme-purple-400 text-sm mt-1">
                              {formatDate(request.requestedDateTime).split(',')[1]}
                            </span>
                          </div>
                        </td>                        <td className="py-5 px-6">
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
                            {request.status}                          </span>
                        </td>
                        
                        <td className="py-5 px-6">
                          {request.ownerResponse ? (                            <div className="relative group">
                              <div className="flex items-center">
                                <div className="max-w-[200px] text-theme-purple-200 truncate">
                                  {request.ownerResponse}
                                </div>
                                <span className="ml-2 text-xs text-theme-purple-400 hover:text-theme-purple-300">(hover to read)</span>
                              </div>
                              <div className="absolute left-0 top-0 mt-8 bg-theme-black-900 border-2 border-theme-purple-600 p-4 rounded-lg shadow-purple-glow z-20 w-80 hidden group-hover:block">
                                <div className="text-theme-purple-100 whitespace-normal">{request.ownerResponse}</div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center text-gray-500 italic">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-theme-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              No response yet
                            </div>
                          )}
                        </td>
                        <td className="py-5 px-6">
                          {request.status === 'Pending' && (
                            <button
                              onClick={() => handleWithdrawRequest(request._id)}
                              className="px-3 py-1.5 bg-red-900 bg-opacity-30 border border-red-700 text-red-400 hover:bg-red-800 hover:text-red-300 rounded-md transition-colors duration-200 flex items-center"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Withdraw
                            </button>
                          )}
                          {request.status !== 'Pending' && (
                            <span className="text-gray-500 text-sm italic">No actions available</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
          {/* New Request Tab */}
        {activeTab === 'new' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-purple-gradient">Request New Test Drive</h2>
              <button
                onClick={() => setActiveTab('requests')}
                className="px-6 py-2.5 rounded-full bg-theme-black-800 border-2 border-theme-purple-600 text-theme-purple-300 hover:text-white hover:bg-theme-purple-800 transition-all duration-300 hover:shadow-purple-neon font-medium"
              >
                Back to My Requests
              </button>
            </div>
            
            {/* Test Drive Request Form */}
            <div className="bg-theme-black-800 p-8 rounded-lg mb-6 border border-theme-purple-600 shadow-purple-glow backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-theme-purple-200 mb-6">Complete Your Test Drive Request</h3>
              
              {formError && (
                <div className="bg-red-900 bg-opacity-30 border border-red-700 text-red-400 px-4 py-3 rounded mb-6">
                  {formError}
                </div>
              )}
              
              <form onSubmit={handleSubmitRequest} className="space-y-6">
                <div>
                  <label className="block text-theme-purple-200 text-sm font-medium mb-2" htmlFor="car">
                    Select Car
                  </label>
                  <select
                    id="car"
                    value={selectedCar}
                    onChange={(e) => setSelectedCar(e.target.value)}
                    className="w-full px-4 py-3 bg-theme-black-900 border border-theme-purple-600 rounded-md focus:outline-none focus:ring-2 focus:ring-theme-purple-500 text-white"
                    required
                  >
                    <option value="">-- Select a car --</option>
                    {availableCars.map(car => (
                      <option key={car._id} value={car._id}>
                        {car.make} {car.model} ({car.year}) - {car.location}
                      </option>
                    ))}
                  </select>
                </div>
                  <div>
                  <label className="flex items-center text-theme-purple-200 text-sm font-medium mb-3" htmlFor="date">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-theme-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Select Test Drive Date
                  </label>
                  
                  <div className="mb-6">
                    <div className="bg-theme-black-800 p-4 border border-theme-purple-600 rounded-md mb-3">
                      <p className="text-theme-purple-300 mb-2 font-medium">Test Drive Time Slot:</p>
                      <p className="text-theme-purple-400">12:00 PM - 10:00 AM next day (22 hours)</p>
                    </div>                    <div className="relative">
                      <div className="flex">
                        <input
                          id="date"
                          type="text"
                          placeholder="Select a date"
                          value={requestDate ? new Date(requestDate).toLocaleDateString('en-GB') : ''}
                          readOnly
                          className="w-full px-4 py-3 bg-theme-black-900 border-2 border-theme-purple-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-theme-purple-500 text-white"
                          onClick={() => {
                            const dateInput = document.getElementById('hidden-date-picker');
                            if(dateInput) dateInput.showPicker ? dateInput.showPicker() : dateInput.click();
                          }}
                        />
                        <button 
                          type="button"
                          onClick={() => {
                            const dateInput = document.getElementById('hidden-date-picker');
                            if(dateInput) dateInput.showPicker ? dateInput.showPicker() : dateInput.click();
                          }}
                          className="bg-theme-purple-600 hover:bg-theme-purple-500 transition-colors duration-200 px-4 py-3 flex items-center justify-center rounded-r-md border-2 border-l-0 border-theme-purple-600 shadow-purple-glow"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                      <input
                        id="hidden-date-picker"
                        type="date"
                        className="opacity-0 absolute w-0 h-0"
                        min={new Date().toISOString().split('T')[0]} // Disable past dates
                        onChange={(e) => {
                          const selectedDate = e.target.value;
                          if (selectedDate) {
                            setRequestDate(`${selectedDate}T12:00`);
                          } else {
                            setRequestDate('');
                          }
                        }}
                        required
                      />
                    </div>
                    
                    <p className="text-theme-purple-400 text-sm mt-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Test drive starts at 12:00 PM and ends at 10:00 AM the next day.
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-theme-purple-200 text-sm font-medium mb-2" htmlFor="message">
                    Message to Owner (Optional)
                  </label>
                  <textarea
                    id="message"
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    className="w-full px-4 py-3 bg-theme-black-900 border border-theme-purple-600 rounded-md focus:outline-none focus:ring-2 focus:ring-theme-purple-500 text-white"
                    rows="4"
                    placeholder="Introduce yourself and explain why you'd like to test drive this car"
                  ></textarea>
                </div>
                
                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('requests')}
                    className="mr-4 px-6 py-2.5 bg-theme-black-900 border-2 border-theme-purple-600 text-theme-purple-300 hover:text-white hover:bg-theme-purple-700 transition-all duration-300 rounded-full"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="gradient-button px-6 py-2.5 rounded-full text-white font-medium shadow-purple-glow hover:shadow-purple-neon transform hover:scale-105 transition-all duration-300"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
              <h3 className="text-xl font-semibold text-theme-purple-200 mb-6 mt-8">Available Cars</h3>
            
            {availableCars.length === 0 ? (
              <div className="text-center py-12 bg-theme-black-800 rounded-lg border border-theme-purple-600">
                <p className="text-theme-purple-300 text-lg">There are no cars available for test drive at the moment.</p>
                <p className="text-theme-purple-400 mt-2">Please check back later for new listings.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableCars.map(car => (
                  <div key={car._id} className="bg-theme-black-800 rounded-lg overflow-hidden border border-theme-purple-600 shadow-purple-glow hover:shadow-purple-neon transition-all duration-300 transform hover:scale-102">
                    <div className="h-48 overflow-hidden relative">
                      <img 
                        src={car.image ? (car.image.startsWith('http') 
                           ? car.image 
                           : car.image.startsWith('/uploads/')
                             ? `http://localhost:5000${car.image}`
                             : `http://localhost:5000/uploads/${car.image}`)
                           : 'https://via.placeholder.com/400x200.png?text=No+Image'
                        } 
                        alt={`${car.make} ${car.model}`}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/400x200.png?text=No+Image';
                        }}
                      />
                      <div className="absolute bottom-0 right-0 bg-theme-purple-900 bg-opacity-90 px-3 py-1.5 text-white text-sm font-medium">
                        ₹{car.price}/day
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-transparent bg-clip-text bg-purple-gradient mb-3">{car.year} {car.make} {car.model}</h3>
                      <div className="text-sm text-theme-purple-200 space-y-1.5 mb-5">
                        <p className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-theme-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {car.location}
                        </p>
                        <p><span className="text-theme-purple-400">Color:</span> {car.color}</p>
                        <p><span className="text-theme-purple-400">Transmission:</span> {car.transmission}</p>
                        <p><span className="text-theme-purple-400">Fuel Type:</span> {car.fuelType}</p>
                      </div>
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-theme-purple-700">
                        <Link 
                          to={`/cars/${car._id}`}
                          className="text-theme-purple-300 hover:text-theme-purple-200 hover:underline transition-colors duration-200"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedCar(car._id);
                            setShowRequestForm(true);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="px-4 py-2 bg-theme-purple-600 hover:bg-theme-purple-500 text-white rounded-full transition-colors duration-300 flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Request Test Drive
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}      </div>
      
      {/* Confirmation Dialog */}
      {confirmDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-theme-black-900 rounded-lg shadow-purple-glow p-6 max-w-md mx-auto border border-theme-purple-700">
            <h2 className="text-xl font-bold text-theme-purple-300 mb-4">Confirm Action</h2>
            <p className="text-theme-purple-300 mb-6">{confirmDialog.message}</p>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-theme-gray-700 hover:bg-theme-gray-600 rounded-md text-white transition"
                onClick={() => setConfirmDialog({ open: false, requestId: null, message: '' })}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-md text-white transition"
                onClick={() => confirmWithdrawal(confirmDialog.requestId)}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
        {/* User Profile Modal */}
      <UserProfileModal 
        isOpen={profileModal.isOpen}
        userId={profileModal.userId}
        onClose={closeProfileModal}
      />
    </div>
  );
};

export default JournalistDashboardPage;
