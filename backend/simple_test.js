const mysql = require('mysql');
require('dotenv').config();

// Set default values if .env is not available
const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ngo_linkup'
};

console.log('🔧 Database Configuration:', {
  host: config.host,
  user: config.user,
  database: config.database
});

const db = mysql.createConnection(config);

db.connect((err) => {
  if (err) {
    console.log("❌ MySQL connection error:", err);
    return;
  }
  console.log("✅ MySQL Connected");
  
  // Test if organization_members table exists and has correct structure
  db.query("SHOW TABLES LIKE 'organization_members'", (err, results) => {
    if (err) {
      console.log("❌ Error checking organization_members table:", err);
      return;
    }
    
    if (results.length === 0) {
      console.log("❌ Organization_members table does not exist!");
      console.log("Please run the SQL script: backend/complete_database_setup.sql");
      return;
    }
    
    console.log("✅ Organization_members table exists");
    
    // Check table structure
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
        console.log("❌ password_hash column missing! This is required for login.");
        console.log("Please run the SQL script: backend/complete_database_setup.sql");
      } else {
        console.log("✅ password_hash column exists");
      }
      
      // Test a simple insert to see if the table works
      const testData = {
        organization_type: 'NGO',
        organization_name: 'Test NGO',
        pan_no: 'TEST123456',
        email: 'test@example.com',
        mobile_no: '9876543210',
        spoc_name: 'Test User',
        password_hash: '$2b$10$test.hash.here'
      };
      
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
          if (err.code === 'ER_DUP_ENTRY') {
            console.log("ℹ️ This is expected if test data already exists");
          }
        } else {
          console.log("✅ Test insert successful, ID:", result.insertId);
          
          // Clean up test data
          db.query("DELETE FROM organization_members WHERE email = ?", [testData.email], (err) => {
            if (err) {
              console.log("⚠️ Could not clean up test data:", err.message);
            } else {
              console.log("✅ Test data cleaned up");
            }
            db.end();
          });
        }
      });
    });
  });
}); 