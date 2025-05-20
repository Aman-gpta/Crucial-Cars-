// backend/scripts/test-requests-api.js
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

// This script tests the requests API endpoints

const baseUrl = 'http://localhost:5000/api';
let token = null;
let carId = null;
let requestId = null;

// Mock user credentials - use a valid journalist account from the database
const testUser = {
    email: 'gagan@gmail.com', 
    password: 'gagan123',
};

// Helper function to make API requests
async function makeRequest(endpoint, method = 'GET', body = null, auth = true) {
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (auth && token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const options = {
        method,
        headers,
    };
    
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    try {
        console.log(`Making ${method} request to ${endpoint}`);
        const response = await fetch(`${baseUrl}${endpoint}`, options);
        const data = await response.json();
        
        console.log(`Response status: ${response.status}`);
        console.log('Response data:', data);
        
        return { status: response.status, data };
    } catch (error) {
        console.error('Request error:', error);
        return { status: 500, data: { message: error.message } };
    }
}

// Step 1: Login to get authentication token
async function login() {
    console.log('=== Step 1: Login ===');
    const { status, data } = await makeRequest('/users/login', 'POST', testUser, false);
    
    if (status === 200 && data.token) {
        token = data.token;
        console.log('Login successful! Token obtained.');
        return true;
    } else {
        console.error('Login failed:', data.message);
        return false;
    }
}

// Step 2: Get a car to test with
async function getTestCar() {
    console.log('\n=== Step 2: Get a test car ===');
    const { status, data } = await makeRequest('/cars');
    
    if (status === 200 && data.length > 0) {
        carId = data[0]._id;
        console.log(`Found test car: ${data[0].make} ${data[0].model} (${carId})`);
        return true;
    } else {
        console.error('Failed to get test car:', data.message);
        return false;
    }
}

// Step 3: Check for existing requests
async function checkExistingRequest() {
    console.log('\n=== Step 3: Check existing request ===');
    const { status, data } = await makeRequest(`/requests/check/${carId}`);
    
    if (status === 200) {
        console.log('Existing request found!');
        requestId = data._id;
        return true;
    } else if (status === 404) {
        console.log('No existing request found.');
        return false;
    } else {
        console.error('Error checking for existing request:', data.message);
        return false;
    }
}

// Step 4: Create a test request
async function createRequest() {
    console.log('\n=== Step 4: Create test request ===');
    const { status, data } = await makeRequest('/requests', 'POST', { carId });
    
    if (status === 201) {
        console.log('Test request created successfully!');
        requestId = data._id;
        return true;
    } else {
        console.error('Failed to create test request:', data.message);
        return false;
    }
}

// Step 5: Withdraw the request
async function withdrawRequest() {
    console.log('\n=== Step 5: Withdraw test request ===');
    
    if (!requestId) {
        console.log('No request ID available to withdraw.');
        return false;
    }
    
    const { status, data } = await makeRequest(`/requests/${requestId}`, 'DELETE');
    
    if (status === 200) {
        console.log('Test request withdrawn successfully!');
        return true;
    } else {
        console.error('Failed to withdraw test request:', data.message);
        return false;
    }
}

// Main test function
async function runTests() {
    try {
        // Step 1: Login
        if (!await login()) return;
        
        // Step 2: Get a test car
        if (!await getTestCar()) return;
        
        // Step 3: Check for existing request
        const hasExistingRequest = await checkExistingRequest();
        
        if (hasExistingRequest) {
            // If there's an existing request, withdraw it
            await withdrawRequest();
        } else {
            // If no existing request, create one
            if (await createRequest()) {
                // Then withdraw it
                await withdrawRequest();
            }
        }
        
        console.log('\n=== Tests completed ===');
    } catch (error) {
        console.error('Test error:', error);
    }
}

// Run the tests
runTests();
