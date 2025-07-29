const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ngo_linkup'
});

db.connect((err) => {
  if (err) {
    console.log("❌ MySQL connection error:", err);
    return;
  }
  console.log("✅ MySQL Connected");
  
  // Check current table structure
  db.query("DESCRIBE organization_members", (err, results) => {
    if (err) {
      console.log("❌ Error describing organization_members table:", err);
      return;
    }
    
    console.log("📋 Current organization_members table structure:");
    results.forEach(column => {
      console.log(`- ${column.Field}: ${column.Type}`);
    });
    
    // Check if password_hash column exists
    const hasPasswordHash = results.some(col => col.Field === 'password_hash');
    
    if (!hasPasswordHash) {
      console.log("\n❌ password_hash column missing! Adding it now...");
      
      db.query("ALTER TABLE organization_members ADD COLUMN password_hash VARCHAR(255) AFTER reg_date", (err) => {
        if (err) {
          console.log("❌ Error adding password_hash column:", err.message);
          return;
        }
        console.log("✅ password_hash column added successfully!");
        
        // Verify the column was added
        db.query("DESCRIBE organization_members", (err, newResults) => {
          if (err) {
            console.log("❌ Error verifying table structure:", err);
            return;
          }
          
          console.log("\n📋 Updated organization_members table structure:");
          newResults.forEach(column => {
            console.log(`- ${column.Field}: ${column.Type}`);
          });
          
          const hasPasswordHashNow = newResults.some(col => col.Field === 'password_hash');
          if (hasPasswordHashNow) {
            console.log("\n🎉 Database fixed! password_hash column is now available.");
            console.log("✅ Organization Member registration and login should now work correctly.");
          } else {
            console.log("\n❌ Failed to add password_hash column.");
          }
          
          db.end();
        });
      });
    } else {
      console.log("\n✅ password_hash column already exists!");
      console.log("✅ Organization Member registration and login should work correctly.");
      db.end();
    }
  });
}); 