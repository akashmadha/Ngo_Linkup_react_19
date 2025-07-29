const mysql = require('mysql');
const bcrypt = require('bcrypt');

console.log('🚀 Starting Comprehensive Trust Member Portal Test...\n');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ngo_linkup'
});

db.connect(async (err) => {
  if (err) {
    console.log("❌ MySQL connection error:", err);
    return;
  }
  console.log("✅ MySQL Connected");
  
  // Step 1: Check database structure
  await checkDatabaseStructure();
});

async function checkDatabaseStructure() {
  console.log('\n📋 Step 1: Checking Database Structure...');
  
  db.query("DESCRIBE organization_members", (err, results) => {
    if (err) {
      console.log("❌ Error describing organization_members table:", err);
      return;
    }
    
    console.log("📋 Organization_members table structure:");
    results.forEach(column => {
      console.log(`- ${column.Field}: ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // Check if password_hash column exists
    const hasPasswordHash = results.some(col => col.Field === 'password_hash');
    
    if (!hasPasswordHash) {
      console.log("\n❌ password_hash column missing! Fixing database...");
      fixDatabase();
    } else {
      console.log("\n✅ password_hash column exists");
      testRegistration();
    }
  });
}

function fixDatabase() {
  console.log('\n🔧 Fixing database structure...');
  
  db.query("ALTER TABLE organization_members ADD COLUMN password_hash VARCHAR(255) AFTER reg_date", (err) => {
    if (err) {
      console.log("❌ Error adding password_hash column:", err.message);
      return;
    }
    console.log("✅ password_hash column added successfully!");
    
    // Verify the fix
    db.query("DESCRIBE organization_members", (err, results) => {
      if (err) {
        console.log("❌ Error verifying table structure:", err);
        return;
      }
      
      const hasPasswordHashNow = results.some(col => col.Field === 'password_hash');
      if (hasPasswordHashNow) {
        console.log("✅ Database fixed successfully!");
        testRegistration();
      } else {
        console.log("❌ Failed to add password_hash column");
      }
    });
  });
}

async function testRegistration() {
  console.log('\n🧪 Step 2: Testing Registration...');
  
  const testPassword = 'test123';
  const saltRounds = 10;
  
  try {
    const password_hash = await bcrypt.hash(testPassword, saltRounds);
    console.log('✅ Password hashed successfully');
    
    const testData = {
      organization_type: 'NGO',
      organization_name: 'Test NGO',
      pan_no: 'TEST123456',
      email: 'test@example.com',
      mobile_no: '9876543210',
      spoc_name: 'Test User',
      password_hash: password_hash
    };
    
    // Clean up any existing test data
    db.query("DELETE FROM organization_members WHERE email = ?", [testData.email], (err) => {
      if (err) {
        console.log("⚠️ Could not clean up existing test data:", err.message);
      }
      
      // Insert test data
      const sql = `INSERT INTO organization_members (
        organization_type, organization_name, pan_no, email, mobile_no, spoc_name, password_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      
      db.query(sql, [
        testData.organization_type,
        testData.organization_name,
        testData.pan_no,
        testData.email,
        testData.mobile_no,
        testData.spoc_name,
        testData.password_hash
      ], (err, result) => {
        if (err) {
          console.log("❌ Test registration failed:", err.message);
          return;
        }
        
        console.log("✅ Test registration successful, ID:", result.insertId);
        testLogin(testData.email, testPassword);
      });
    });
  } catch (error) {
    console.log("❌ Error during registration test:", error.message);
  }
}

async function testLogin(email, password) {
  console.log('\n🧪 Step 3: Testing Login...');
  
  // Query the user
  db.query("SELECT * FROM organization_members WHERE email = ?", [email], async (err, results) => {
    if (err) {
      console.log("❌ Error querying user:", err.message);
      return;
    }
    
    if (results.length === 0) {
      console.log("❌ User not found");
      return;
    }
    
    const user = results[0];
    console.log("✅ User found:", user.email);
    console.log("📋 User details:");
    console.log(`- ID: ${user.id}`);
    console.log(`- Organization: ${user.organization_name}`);
    console.log(`- Status: ${user.status}`);
    console.log(`- Password hash exists: ${user.password_hash ? 'YES' : 'NO'}`);
    
    if (!user.password_hash) {
      console.log("❌ Password hash is NULL - this will cause login to fail");
      cleanup();
      return;
    }
    
    // Test password verification
    try {
      const match = await bcrypt.compare(password, user.password_hash);
      console.log("✅ Password verification:", match ? "SUCCESS" : "FAILED");
      
      if (match) {
        console.log("🎉 Login test successful!");
        console.log("✅ Trust Member Portal is working correctly!");
      } else {
        console.log("❌ Login test failed - password doesn't match");
      }
    } catch (error) {
      console.log("❌ Error during password verification:", error.message);
    }
    
    cleanup();
  });
}

function cleanup() {
  console.log('\n🧹 Cleaning up test data...');
  
  db.query("DELETE FROM organization_members WHERE email = ?", ['test@example.com'], (err) => {
    if (err) {
      console.log("⚠️ Could not clean up test data:", err.message);
    } else {
      console.log("✅ Test data cleaned up");
    }
    
    console.log('\n📊 Test Summary:');
    console.log('✅ Database structure checked');
    console.log('✅ Registration tested');
    console.log('✅ Login tested');
    console.log('\n🎉 Trust Member Portal test completed!');
    
    db.end();
  });
} 