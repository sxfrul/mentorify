const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3000; // Set to a port that is not used by MySQL

// Middleware
app.use(cors()); // Allows cross-origin requests (useful for connecting frontend and backend)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection
const db = mysql.createConnection({
  host: "localhost",         // Replace with your MySQL host
  user: "root",              // Replace with your MySQL username
  password: "mentorify",     // Replace with your MySQL password
  database: "mentorify"      // Replace with your MySQL database name
});

// Connect to the MySQL database
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err.message);
    return;
  }
  console.log("Connected to MySQL database.");
});

// Login API
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const query = "SELECT * FROM users WHERE email = ?";
  db.query(query, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database query error." });
    }

    // Check if any user was found
    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const user = results[0];

    // Compare the input password with the stored password (plain text comparison)
    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Login successful
    res.json({ message: "Login successful", userId: user.id });
  });
});

// Get user information by ID
app.get("/user/:id", (req, res) => {
    const userId = req.params.id;
    console.log("Fetching user info for user ID:", userId); // Debugging line
  
    const query = "SELECT name, email, dob FROM users WHERE id = ?";
    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error("Database query error:", err); // Log the error
        return res.status(500).json({ error: "Database query error." });
      }
  
      if (results.length === 0) {
        console.log("User not found for ID:", userId); // Debugging line
        return res.status(404).json({ error: "User not found." });
      }
  
      res.json(results[0]);
    });
  });
  
// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
