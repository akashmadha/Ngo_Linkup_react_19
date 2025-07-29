const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3001';

async function testMasterAPI() {
  console.log('🧪 Testing Master Data API...\n');

  try {
    // Test 1: Get states (should be empty initially)
    console.log('1. Testing GET /api/admin/states...');
    const response1 = await fetch(`${API_BASE_URL}/api/admin/states`, {
      headers: {
        'user-id': '1', // Using admin ID 1 for testing
      },
    });
    
    if (response1.ok) {
      const data1 = await response1.json();
      console.log('✅ States API working - Found', data1.data?.length || 0, 'states');
    } else {
      console.log('❌ States API failed:', response1.status, response1.statusText);
    }

    // Test 2: Add a test state
    console.log('\n2. Testing POST /api/admin/states...');
    const response2 = await fetch(`${API_BASE_URL}/api/admin/states`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'user-id': '1',
      },
      body: JSON.stringify({
        name: 'Test State',
        code: 'TS'
      }),
    });
    
    if (response2.ok) {
      const data2 = await response2.json();
      console.log('✅ State added successfully:', data2.message);
    } else {
      const error2 = await response2.json();
      console.log('❌ Failed to add state:', error2.error);
    }

    // Test 3: Get states again (should have one now)
    console.log('\n3. Testing GET /api/admin/states (after adding)...');
    const response3 = await fetch(`${API_BASE_URL}/api/admin/states`, {
      headers: {
        'user-id': '1',
      },
    });
    
    if (response3.ok) {
      const data3 = await response3.json();
      console.log('✅ States API working - Found', data3.data?.length || 0, 'states');
      if (data3.data?.length > 0) {
        console.log('📝 First state:', data3.data[0]);
      }
    } else {
      console.log('❌ States API failed:', response3.status, response3.statusText);
    }

    console.log('\n🎉 Master Data API test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testMasterAPI(); 