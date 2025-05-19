// frontend/src/pages/journalist/JournalistDashboardPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchCars } from '../../services/carService';
import { fetchOutgoingRequests, createTestDriveRequest } from '../../services/requestService';

const JournalistDashboardPage = () => {
  const { userInfo } = useAuth();
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

  // New request form state
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedCar, setSelectedCar] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [requestDate, setRequestDate] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

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
    
    try {
      const requestData = {
        carId: selectedCar,
        message: requestMessage,
        requestedDateTime: requestDate || undefined
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
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge class
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-theme-black-800 rounded-lg p-4 shadow-purple-glow border border-theme-purple-700">
            <h3 className="text-lg font-semibold text-theme-purple-400">Total Requests</h3>
            <p className="text-3xl font-bold text-theme-purple-300">{stats.totalRequests}</p>
          </div>
          <div className="bg-theme-black-800 rounded-lg p-4 shadow-purple-glow border border-theme-purple-700">
            <h3 className="text-lg font-semibold text-theme-purple-400">Pending</h3>
            <p className="text-3xl font-bold text-yellow-400">{stats.pendingRequests}</p>
          </div>
          <div className="bg-theme-black-800 rounded-lg p-4 shadow-purple-glow border border-theme-purple-700">
            <h3 className="text-lg font-semibold text-theme-purple-400">Approved</h3>
            <p className="text-3xl font-bold text-green-400">{stats.approvedRequests}</p>
          </div>
          <div className="bg-theme-black-800 rounded-lg p-4 shadow-purple-glow border border-theme-purple-700">
            <h3 className="text-lg font-semibold text-theme-purple-400">Rejected</h3>
            <p className="text-3xl font-bold text-red-400">{stats.rejectedRequests}</p>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="border-b border-theme-purple-800 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'requests'
                  ? 'border-theme-purple-500 text-theme-purple-400'
                  : 'border-transparent text-gray-400 hover:text-theme-purple-300 hover:border-theme-purple-300'
              }`}
            >
              My Requests
            </button>
            <button
              onClick={() => {setActiveTab('new'); setShowRequestForm(true);}}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'new'
                  ? 'border-theme-purple-500 text-theme-purple-400'
                  : 'border-transparent text-gray-400 hover:text-theme-purple-300 hover:border-theme-purple-300'
              }`}
            >
              New Request
            </button>
          </nav>
        </div>
        
        {/* My Requests Tab */}
        {activeTab === 'requests' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">My Test Drive Requests</h2>
              <button
                onClick={() => setActiveTab('cars')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Request New Test Drive
              </button>
            </div>
            
            {requests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">You haven't made any test drive requests yet.</p>
                <button
                  onClick={() => setActiveTab('cars')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Browse Available Cars
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-3 px-4 text-left">Car</th>
                      <th className="py-3 px-4 text-left">Owner</th>
                      <th className="py-3 px-4 text-left">Requested Date</th>
                      <th className="py-3 px-4 text-left">Status</th>
                      <th className="py-3 px-4 text-left">Owner Response</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {requests.map(request => (
                      <tr key={request._id}>
                        <td className="py-3 px-4 font-medium">
                          {request.car ? (
                            <div className="flex items-center">
                              {request.car.image && (                                <img 
                                  src={request.car.image.startsWith('http') 
                                    ? request.car.image 
                                    : request.car.image.startsWith('/uploads/')
                                      ? request.car.image
                                      : `/uploads/${request.car.image}`
                                  } 
                                  alt={`${request.car.make} ${request.car.model}`}
                                  className="h-10 w-16 object-cover rounded mr-2" 
                                />
                              )}
                              <span>{request.car.make} {request.car.model} ({request.car.year})</span>
                            </div>
                          ) : (
                            'Unknown Car'
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {request.owner?.name || 'Unknown Owner'}
                        </td>
                        <td className="py-3 px-4">
                          {formatDate(request.requestedDateTime)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(request.status)}`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate">
                          {request.ownerResponse || 'No response yet'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        
        {/* Available Cars Tab */}
        {activeTab === 'cars' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Available Cars for Test Drive</h2>
              {showRequestForm ? (
                <button
                  onClick={() => setShowRequestForm(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                >
                  Cancel Request
                </button>
              ) : null}
            </div>
            
            {/* Test Drive Request Form */}
            {showRequestForm && (
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h3 className="text-lg font-semibold mb-4">Request a Test Drive</h3>
                
                {formError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {formError}
                  </div>
                )}
                
                <form onSubmit={handleSubmitRequest}>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="car">
                      Select Car
                    </label>
                    <select
                      id="car"
                      value={selectedCar}
                      onChange={(e) => setSelectedCar(e.target.value)}
                      className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
                      Preferred Date/Time (Optional)
                    </label>
                    <input
                      id="date"
                      type="datetime-local"
                      value={requestDate}
                      onChange={(e) => setRequestDate(e.target.value)}
                      className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="message">
                      Message to Owner (Optional)
                    </label>
                    <textarea
                      id="message"
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      rows="3"
                      placeholder="Introduce yourself and explain why you'd like to test drive this car"
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                      Submit Request
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {availableCars.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">There are no cars available for test drive at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableCars.map(car => (
                  <div key={car._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                    <div className="h-48 overflow-hidden">                      <img 
                        src={car.image.startsWith('http') 
                           ? car.image 
                           : car.image.startsWith('/uploads/')
                             ? car.image
                             : `/uploads/${car.image}`
                        } 
                        alt={`${car.make} ${car.model}`}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-xl font-semibold mb-2">{car.make} {car.model}</h3>
                      <div className="text-sm text-gray-600 space-y-1 mb-4">
                        <p><span className="font-medium">Year:</span> {car.year}</p>
                        <p><span className="font-medium">Color:</span> {car.color}</p>
                        <p><span className="font-medium">Location:</span> {car.location}</p>
                        <p><span className="font-medium">Transmission:</span> {car.transmission}</p>
                        <p><span className="font-medium">Fuel Type:</span> {car.fuelType}</p>
                      </div>
                      <div className="mt-2">
                        <Link 
                          to={`/cars/${car._id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm mr-3"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedCar(car._id);
                            setShowRequestForm(true);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded"
                        >
                          Request Test Drive
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JournalistDashboardPage;
