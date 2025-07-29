const db = require('./db');

async function setupMasterTables() {
  try {
    console.log('Setting up master tables (structure only)...');
    
    // Create states table
    console.log('Creating states table...');
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS states (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        code VARCHAR(10) UNIQUE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_code (code),
        INDEX idx_is_active (is_active)
      )
    `);

    // Create districts table
    console.log('Creating districts table...');
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS districts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        state_id INT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE,
        UNIQUE KEY unique_district_state (name, state_id),
        INDEX idx_name (name),
        INDEX idx_state_id (state_id),
        INDEX idx_is_active (is_active)
      )
    `);

    // Create cities table
    console.log('Creating cities table...');
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS cities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        district_id INT NOT NULL,
        state_id INT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE,
        FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE,
        UNIQUE KEY unique_city_district (name, district_id),
        INDEX idx_name (name),
        INDEX idx_district_id (district_id),
        INDEX idx_state_id (state_id),
        INDEX idx_is_active (is_active)
      )
    `);

    // Create talukas table
    console.log('Creating talukas table...');
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS talukas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        district_id INT NOT NULL,
        state_id INT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE,
        FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE,
        UNIQUE KEY unique_taluka_district (name, district_id),
        INDEX idx_name (name),
        INDEX idx_district_id (district_id),
        INDEX idx_state_id (state_id),
        INDEX idx_is_active (is_active)
      )
    `);

    // Create occupations table
    console.log('Creating occupations table...');
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS occupations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_is_active (is_active)
      )
    `);

    // Create designations table
    console.log('Creating designations table...');
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS designations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_is_active (is_active)
      )
    `);
    
    console.log('✅ Master tables structure created successfully!');
    console.log('📝 Tables are empty and ready for admin entries.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up master tables:', error);
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

// Run the setup
setupMasterTables(); 