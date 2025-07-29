const mysql = require('mysql');
require('dotenv').config();

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
  
  // Test if organization_members table exists
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
      
      // Check sample data
      db.query("SELECT id, organization_name, email, status, created_at FROM organization_members LIMIT 3", (err, results) => {
        if (err) {
          console.log("❌ Error querying organization_members:", err);
          return;
        }
        
        console.log("📋 Sample organization members:");
        results.forEach(member => {
          console.log(`- ID: ${member.id}, Name: ${member.organization_name}, Email: ${member.email}, Status: ${member.status}`);
        });
        
        if (results.length === 0) {
          console.log("ℹ️ No organization members found in database");
        }
        
        db.end();
      });
    });
  });
}); 