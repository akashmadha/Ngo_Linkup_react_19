const db = require('./db');

async function cleanMasterTables() {
  try {
    console.log('Cleaning master tables - removing all sample data...');
    
    // Clean all sample data from tables
    console.log('Clearing states table...');
    await executeQuery('DELETE FROM states');
    await executeQuery('ALTER TABLE states AUTO_INCREMENT = 1');
    
    console.log('Clearing districts table...');
    await executeQuery('DELETE FROM districts');
    await executeQuery('ALTER TABLE districts AUTO_INCREMENT = 1');
    
    console.log('Clearing cities table...');
    await executeQuery('DELETE FROM cities');
    await executeQuery('ALTER TABLE cities AUTO_INCREMENT = 1');
    
    console.log('Clearing talukas table...');
    await executeQuery('DELETE FROM talukas');
    await executeQuery('ALTER TABLE talukas AUTO_INCREMENT = 1');
    
    console.log('Clearing occupations table...');
    await executeQuery('DELETE FROM occupations');
    await executeQuery('ALTER TABLE occupations AUTO_INCREMENT = 1');
    
    console.log('Clearing designations table...');
    await executeQuery('DELETE FROM designations');
    await executeQuery('ALTER TABLE designations AUTO_INCREMENT = 1');
    
    console.log('✅ All sample data removed successfully!');
    console.log('📝 Tables are now empty and ready for admin entries.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning master tables:', error);
    process.exit(1);
  }
}

function executeQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

// Run the cleanup
cleanMasterTables(); 