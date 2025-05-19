// frontend/src/pages/owner/OwnerDashboardPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchCarsByOwner, updateCarAvailability } from '../../services/carService';
import { fetchIncomingRequests, updateRequestStatus } from '../../services/requestService';

const OwnerDashboardPage = () => {
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Owner Dashboard</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4 shadow">
            <h3 className="text-lg font-semibold text-blue-800">Total Cars</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalCars}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 shadow">
            <h3 className="text-lg font-semibold text-green-800">Active Listings</h3>
            <p className="text-3xl font-bold text-green-600">{stats.activeCars}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 shadow">
            <h3 className="text-lg font-semibold text-purple-800">Total Requests</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.totalRequests}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 shadow">
            <h3 className="text-lg font-semibold text-yellow-800">Pending Requests</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.pendingRequests}</p>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('cars')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'cars'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Cars
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'requests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Test Drive Requests
            </button>
          </nav>
        </div>
        
        {/* My Cars Tab */}
        {activeTab === 'cars' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">My Cars</h2>
              <Link
                to="/cars/new"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Add New Car
              </Link>
            </div>
            
            {cars.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">You haven't listed any cars yet.</p>
                <Link
                  to="/cars/new"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  List Your First Car
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-3 px-4 text-left">Image</th>
                      <th className="py-3 px-4 text-left">Make & Model</th>
                      <th className="py-3 px-4 text-left">Year</th>
                      <th className="py-3 px-4 text-left">Location</th>
                      <th className="py-3 px-4 text-left">Status</th>
                      <th className="py-3 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {cars.map(car => (
                      <tr key={car._id}>
                        <td className="py-3 px-4">
                          <img 
                            src={car.image.startsWith('http') 
                              ? car.image 
                              : car.image.startsWith('/uploads/')
                                ? car.image
                                : `/uploads/${car.image}`
                            } 
                            alt={`${car.make} ${car.model}`}
                            className="h-16 w-24 object-cover rounded" 
                          />
                        </td>
                        <td className="py-3 px-4 font-medium">{car.make} {car.model}</td>
                        <td className="py-3 px-4">{car.year}</td>
                        <td className="py-3 px-4">{car.location}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            car.isAvailable 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {car.isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Link 
                              to={`/cars/${car._id}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              View
                            </Link>
                            <Link 
                              to={`/cars/${car._id}/edit`}
                              className="text-indigo-600 hover:text-indigo-800"
                            >
                              Edit
                            </Link>
                            <button 
                              onClick={() => toggleCarAvailability(car._id, car.isAvailable)}
                              className={`${
                                car.isAvailable 
                                  ? 'text-red-600 hover:text-red-800' 
                                  : 'text-green-600 hover:text-green-800'
                              }`}
                            >
                              {car.isAvailable ? 'Disable' : 'Enable'}
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
            <h2 className="text-xl font-semibold mb-4">Test Drive Requests</h2>
            
            {requests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">You don't have any test drive requests yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-3 px-4 text-left">Journalist</th>
                      <th className="py-3 px-4 text-left">Car</th>
                      <th className="py-3 px-4 text-left">Requested Date</th>
                      <th className="py-3 px-4 text-left">Status</th>
                      <th className="py-3 px-4 text-left">Message</th>
                      <th className="py-3 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {requests.map(request => (
                      <tr key={request._id}>
                        <td className="py-3 px-4 font-medium">
                          {request.journalist?.name || 'Unknown'}
                        </td>
                        <td className="py-3 px-4">
                          {request.car ? `${request.car.make} ${request.car.model} (${request.car.year})` : 'Unknown Car'}
                        </td>
                        <td className="py-3 px-4">
                          {request.requestedDateTime 
                            ? new Date(request.requestedDateTime).toLocaleDateString() 
                            : 'Not specified'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                            request.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate">
                          {request.message || 'No message'}
                        </td>
                        <td className="py-3 px-4">
                          {request.status === 'Pending' && (
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleRequestUpdate(request._id, 'Approved')}
                                className="text-green-600 hover:text-green-800"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleRequestUpdate(request._id, 'Rejected')}
                                className="text-red-600 hover:text-red-800"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {request.status === 'Approved' && (
                            <button 
                              onClick={() => handleRequestUpdate(request._id, 'Completed')}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Mark Completed
                            </button>
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
      </div>
    </div>
  );
};

export default OwnerDashboardPage;
