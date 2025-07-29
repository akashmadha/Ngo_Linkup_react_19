const mysql = require('mysql');
const bcrypt = require('bcrypt');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ngo_linkup'
});

db.connect(async (err) => {
  if (err) {
    console.log("❌ MySQL connection error:", err);
    return;
  }
  console.log("✅ MySQL Connected");
  
  // Check if password_hash column exists
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
      console.log("❌ password_hash column missing! Running fix...");
      
      // Add the column
      db.query("ALTER TABLE organization_members ADD COLUMN password_hash VARCHAR(255) AFTER reg_date", (err) => {
        if (err) {
          console.log("❌ Error adding password_hash column:", err.message);
          return;
        }
        console.log("✅ password_hash column added successfully");
        testRegistration();
      });
    } else {
      console.log("✅ password_hash column exists");
      testRegistration();
    }
  });
});

async function testRegistration() {
  console.log('\n🧪 Testing registration with password hashing...');
  
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
    
    // First, delete any existing test data
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
          console.log("❌ Test insert failed:", err.message);
          return;
        }
        
        console.log("✅ Test registration successful, ID:", result.insertId);
        
        // Test login
        testLogin(testData.email, testPassword);
      });
    });
  } catch (error) {
    console.log("❌ Error hashing password:", error.message);
  }
}

async function testLogin(email, password) {
  console.log('\n🧪 Testing login...');
  
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
    
    // Test password verification
    try {
      const match = await bcrypt.compare(password, user.password_hash);
      console.log("✅ Password verification:", match ? "SUCCESS" : "FAILED");
      
      if (match) {
        console.log("🎉 Login test successful!");
      } else {
        console.log("❌ Login test failed - password doesn't match");
      }
    } catch (error) {
      console.log("❌ Error during password verification:", error.message);
    }
    
    // Clean up test data
    db.query("DELETE FROM organization_members WHERE email = ?", [email], (err) => {
      if (err) {
        console.log("⚠️ Could not clean up test data:", err.message);
      } else {
        console.log("✅ Test data cleaned up");
      }
      db.end();
    });
  });
} 