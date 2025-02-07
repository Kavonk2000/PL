const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",        // MySQL host (localhost for local)
  user: "root",             // MySQL username
  password: "SQLNovak017", // Your MySQL password
  database: "pl_members",  // Name of the database
  port: 3306               // Port where MySQL is running
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    return;
  }
  console.log("Connected to the database.");
});

module.exports = db;
