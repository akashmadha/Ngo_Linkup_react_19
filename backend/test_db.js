const mysql = require("mysql");
require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.log("❌ MySQL connection error:", err);
    return;
  }
  console.log("✅ MySQL Connected");
  
  // Test if admins table exists
  db.query("SHOW TABLES LIKE 'admins'", (err, results) => {
    if (err) {
      console.log("❌ Error checking admins table:", err);
      return;
    }
    
    if (results.length === 0) {
      console.log("❌ Admins table does not exist!");
      console.log("Please run the SQL script: backend/complete_database_setup.sql");
      return;
    }
    
    console.log("✅ Admins table exists");
    
    // Check if admin user exists
    db.query("SELECT id, username, email, role, is_active FROM admins", (err, results) => {
      if (err) {
        console.log("❌ Error querying admins:", err);
        return;
      }
      
      console.log("📋 Admin users in database:");
      results.forEach(admin => {
        console.log(`- ID: ${admin.id}, Username: ${admin.username}, Email: ${admin.email}, Role: ${admin.role}, Active: ${admin.is_active}`);
      });
      
      if (results.length === 0) {
        console.log("❌ No admin users found!");
        console.log("Please run the SQL script: backend/complete_database_setup.sql");
      } else {
        console.log("✅ Admin users found");
      }
      
      // Test password hash
      const bcrypt = require("bcrypt");
      const testPassword = "admin123";
      const expectedHash = "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi";
      
      bcrypt.compare(testPassword, expectedHash).then(match => {
        console.log(`🔐 Password test: ${match ? "✅ Match" : "❌ No match"}`);
      });
      
      db.end();
    });
  });
}); 