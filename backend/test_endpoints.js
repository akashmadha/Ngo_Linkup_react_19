const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';

async function testRegistration() {
  console.log('🧪 Testing Trust Member Registration...');
  
  const testData = {
    ngoType: 'NGO',
    ngoName: 'Test Organization',
    email: 'test@example.com',
    mobileNo: '9876543210',
    spocName: 'Test User',
    panNo: 'ABCDE1234F',
    password: 'test123'
  };

  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Registration successful:', data.message);
      return true;
    } else {
      console.log('❌ Registration failed:', data.error);
      if (data.details) {
        console.log('Details:', data.details);
      }
      return false;
    }
  } catch (error) {
    console.log('❌ Network error during registration:', error.message);
    return false;
  }
}

async function testLogin() {
  console.log('\n🧪 Testing Trust Member Login...');
  
  const loginData = {
    username: 'test@example.com',
    password: 'test123',
    userType: 'member'
  };

  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login successful:', data.message);
      console.log('User ID:', data.userId);
      console.log('User Type:', data.userType);
      console.log('Organization:', data.organizationName);
      return true;
    } else {
      console.log('❌ Login failed:', data.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Network error during login:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Trust Member Portal Tests...\n');
  
  // Test registration
  const registrationSuccess = await testRegistration();
  
  // Test login
  const loginSuccess = await testLogin();
  
  console.log('\n📊 Test Results:');
  console.log(`Registration: ${registrationSuccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Login: ${loginSuccess ? '✅ PASS' : '❌ FAIL'}`);
  
  if (registrationSuccess && loginSuccess) {
    console.log('\n🎉 All tests passed! Trust Member Portal is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the backend logs for details.');
  }
}

// Run tests
runTests().catch(console.error); 