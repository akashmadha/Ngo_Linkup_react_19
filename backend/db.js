// db.js
const mysql = require("mysql");
require("dotenv").config();

let db;

function handleDisconnect() {
  db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  db.connect((err) => {
    if (err) {
      console.log("❌ MySQL connection error:", err);
      setTimeout(handleDisconnect, 2000); // Try again after 2 seconds
    } else {
      console.log("✅ MySQL Connected");
    }
  });

  db.on('error', function(err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.log('⚠️  MySQL connection lost. Reconnecting...');
      handleDisconnect();
    } else {
      throw err;
    }
  });
}

handleDisconnect();

module.exports = db;
