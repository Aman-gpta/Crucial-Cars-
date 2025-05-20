// frontend/src/components/test/TestRequestComponent.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { checkExistingRequest, createTestDriveRequest, withdrawTestDriveRequest } from '../../services/requestService';

const TestRequestComponent = () => {
  const { userInfo } = useAuth();
  const [testResults, setTestResults] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [cars, setCars] = useState([]);
  
  // Add a log message with timestamp
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, { timestamp, message, type }]);
  };
  
  // Clear all logs
  const clearLogs = () => {
    setTestResults([]);
  };
  
  // Fetch available cars on component mount
  useEffect(() => {
    const fetchCars = async () => {
      try {
        addLog('Fetching available cars...');
        const response = await api.get('/cars');
        setCars(response.data);
        addLog(`Found ${response.data.length} cars`, 'success');
      } catch (error) {
        addLog(`Error fetching cars: ${error.message}`, 'error');
      }
    };
    
    fetchCars();
  }, []);
  
  // Test checking auth middleware
  const testAuthMiddleware = async () => {
    try {
      addLog('Testing auth middleware...');
      const response = await api.get('/test/auth-check');
      addLog(`Auth test successful: ${response.data.message}`, 'success');
      addLog(`User: ${response.data.user.name} (${response.data.user.role})`, 'success');
    } catch (error) {
      addLog(`Auth test failed: ${error.response?.data?.message || error.message}`, 'error');
    }
  };
  
  // Test role-based access (journalist only)
  const testJournalistAccess = async () => {
    try {
      addLog('Testing journalist-only access...');
      const response = await api.get('/test/journalist-check');
      addLog(`Journalist test successful: ${response.data.message}`, 'success');
    } catch (error) {
      addLog(`Journalist test failed: ${error.response?.data?.message || error.message}`, 'error');
    }
  };
  
  // Test checking for existing request
  const testCheckExistingRequest = async () => {
    if (!selectedCar) {
      addLog('Please select a car first', 'error');
      return;
    }
    
    try {
      addLog(`Checking for existing request for car: ${selectedCar.make} ${selectedCar.model}...`);
      const response = await checkExistingRequest(selectedCar._id);
      
      if (response) {
        addLog(`Existing request found with ID: ${response._id}`, 'success');
        addLog(`Status: ${response.status}`, 'info');
        addLog(`Created on: ${new Date(response.createdAt).toLocaleString()}`, 'info');
      } else {
        addLog('No existing request found', 'info');
      }
    } catch (error) {
      addLog(`Error checking request: ${error.message}`, 'error');
    }
  };
  
  // Test creating a new request
  const testCreateRequest = async () => {
    if (!selectedCar) {
      addLog('Please select a car first', 'error');
      return;
    }
    
    try {
      addLog(`Creating test drive request for car: ${selectedCar.make} ${selectedCar.model}...`);
      const response = await createTestDriveRequest({ carId: selectedCar._id });
      addLog(`Request created successfully with ID: ${response._id}`, 'success');
      addLog(`Status: ${response.status}`, 'info');
    } catch (error) {
      addLog(`Error creating request: ${error.message}`, 'error');
    }
  };
  
  // Test withdrawing a request
  const testWithdrawRequest = async () => {
    if (!selectedCar) {
      addLog('Please select a car first', 'error');
      return;
    }
    
    try {
      // First check if there's an existing request
      addLog(`Looking for existing request to withdraw...`);
      const existingRequest = await checkExistingRequest(selectedCar._id);
      
      if (!existingRequest) {
        addLog('No existing request found to withdraw', 'error');
        return;
      }
      
      addLog(`Withdrawing request with ID: ${existingRequest._id}...`);
      const response = await withdrawTestDriveRequest(existingRequest._id);
      addLog(`Request withdrawn successfully: ${response.message}`, 'success');
    } catch (error) {
      addLog(`Error withdrawing request: ${error.message}`, 'error');
    }
  };
  
  // Render
  return (
    <div className="bg-theme-black-900 bg-opacity-80 rounded-lg shadow-purple-glow overflow-hidden p-6 md:p-8 lg:p-10 border border-theme-purple-700 backdrop-blur-sm">
      <h2 className="text-2xl font-bold text-theme-purple-200 mb-4">Test Drive Request Tester</h2>
      
      {/* User Info */}
      <div className="mb-6 bg-theme-black-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-theme-purple-300 mb-2">Current User</h3>
        {userInfo ? (
          <div>
            <p className="text-white">Name: {userInfo.name}</p>
            <p className="text-white">Email: {userInfo.email}</p>
            <p className="text-white">Role: {userInfo.role}</p>
            <p className="text-gray-400 text-sm mt-1">ID: {userInfo._id}</p>
            <p className="text-gray-400 text-sm">Token: {userInfo.token ? `${userInfo.token.substring(0, 15)}...` : 'None'}</p>
          </div>
        ) : (
          <p className="text-red-400">Not logged in</p>
        )}
      </div>
      
      {/* Car Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-theme-purple-300 mb-2">Select a Car for Testing</h3>
        <select 
          className="w-full bg-theme-black-800 text-white border border-theme-purple-600 rounded p-2"
          onChange={(e) => {
            const car = cars.find(c => c._id === e.target.value);
            setSelectedCar(car);
            addLog(`Selected car: ${car?.make} ${car?.model}`);
          }}
          value={selectedCar?._id || ''}
        >
          <option value="">-- Select a car --</option>
          {cars.map(car => (
            <option key={car._id} value={car._id}>
              {car.make} {car.model} ({car._id})
            </option>
          ))}
        </select>
        
        {selectedCar && (
          <div className="mt-2 p-2 bg-theme-black-800 rounded text-sm">
            <p className="text-theme-purple-300">Selected: {selectedCar.make} {selectedCar.model}</p>
            <p className="text-gray-400">Owner: {selectedCar.owner?.name || 'Unknown'}</p>
            <p className="text-gray-400">Available: {selectedCar.isAvailable ? 'Yes' : 'No'}</p>
          </div>
        )}
      </div>
      
      {/* Test Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button 
          onClick={testAuthMiddleware}
          className="bg-theme-purple-700 hover:bg-theme-purple-600 text-white py-2 px-4 rounded"
        >
          Test Auth Middleware
        </button>
        
        <button 
          onClick={testJournalistAccess}
          className="bg-theme-purple-700 hover:bg-theme-purple-600 text-white py-2 px-4 rounded"
        >
          Test Journalist Access
        </button>
        
        <button 
          onClick={testCheckExistingRequest}
          className="bg-blue-700 hover:bg-blue-600 text-white py-2 px-4 rounded"
          disabled={!selectedCar}
        >
          Check Existing Request
        </button>
        
        <button 
          onClick={testCreateRequest}
          className="bg-green-700 hover:bg-green-600 text-white py-2 px-4 rounded"
          disabled={!selectedCar}
        >
          Create Test Request
        </button>
        
        <button 
          onClick={testWithdrawRequest}
          className="bg-orange-700 hover:bg-orange-600 text-white py-2 px-4 rounded"
          disabled={!selectedCar}
        >
          Withdraw Request
        </button>
        
        <button 
          onClick={clearLogs}
          className="bg-red-700 hover:bg-red-600 text-white py-2 px-4 rounded"
        >
          Clear Logs
        </button>
      </div>
      
      {/* Test Results */}
      <div className="border border-theme-purple-800 rounded-lg overflow-hidden">
        <div className="bg-theme-purple-900 text-theme-purple-200 p-2 font-medium">
          Test Results
        </div>
        <div className="bg-theme-black-800 p-4 max-h-96 overflow-y-auto">
          {testResults.length === 0 ? (
            <p className="text-gray-500 italic">No test results yet</p>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className={`mb-2 text-sm ${
                result.type === 'error' ? 'text-red-400' : 
                result.type === 'success' ? 'text-green-400' : 
                'text-gray-300'
              }`}>
                <span className="text-gray-500">[{result.timestamp}]</span> {result.message}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TestRequestComponent;
