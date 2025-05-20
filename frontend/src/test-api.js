import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Test basic API connectivity
async function testConnection() {
  try {
    const response = await axios.get(`${API_URL}`);
    console.log('Root API connection test:', response.status, response.data);
    return true;
  } catch (error) {
    console.error('API connection test failed:', error.message);
    return false;
  }
}

// Test login endpoint with test credentials
async function testLogin() {
  try {
    const response = await axios.post(`${API_URL}/users/login`, {
      email: 'test@example.com',
      password: 'test123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('Login test response:', response.status, response.data);
    return true;
  } catch (error) {
    if (error.response) {
      console.log('Login test response error:', error.response.status, error.response.data);
      // 401 is expected for invalid credentials, so this is still a successful test of the endpoint
      return error.response.status === 401;
    } else {
      console.error('Login test network error:', error.message);
      return false;
    }
  }
}

// Run the tests
async function runTests() {
  console.log('Testing API connectivity...');
  const connectionTest = await testConnection();
  console.log('Connection test result:', connectionTest ? 'SUCCESS' : 'FAILED');
  
  console.log('\nTesting login endpoint...');
  const loginTest = await testLogin();
  console.log('Login endpoint test result:', loginTest ? 'SUCCESS' : 'FAILED');
}

runTests();
