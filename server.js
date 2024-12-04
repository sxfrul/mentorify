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
  host: "34.126.191.100",         // Replace with your MySQL host
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

// Save the answer to the database
app.post("/save-answer", (req, res) => {
  const { userId, questionCategory, questionNumber, selectedAnswer } = req.body;

  // Ensure the necessary fields are provided
  if (!userId || !questionCategory || !questionNumber || !selectedAnswer) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // SQL query to insert the user's answer into the user_answers table
  const query = `
    INSERT INTO user_answers (user_id, question_category, question_number, selected_answer)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE selected_answer = VALUES(selected_answer);
  `;
  db.query(query, [userId, questionCategory, questionNumber, selectedAnswer], (err, results) => {
    if (err) {
      console.error("Error saving answer:", err.message);
      return res.status(500).json({ error: "Failed to save answer." });
    }

    // Log the results
    console.log("Answer saved successfully, results:", results); // Logs the results object

    // Send a response back with details
    res.status(200).json({
      message: "Answer saved successfully.",
      affectedRows: results.affectedRows,  // This shows how many rows were affected
      insertId: results.insertId // This shows the ID of the inserted row (if it's auto-incremented)
    });
  });
});


/// Save or update user's disability
app.post("/save-disability", (req, res) => {
  const { userId, disability } = req.body;

  // Ensure the necessary fields are provided
  if (!userId || !disability) {
    return res.status(400).json({ error: "User ID and disability are required." });
  }

  // SQL query to insert the user's disability or update if it already exists
  const query = `
    INSERT INTO user_disabilities (user_id, disability)
    VALUES (?, ?) AS new_values
    ON DUPLICATE KEY UPDATE disability = new_values.disability;
  `;

  db.query(query, [userId, disability], (err, _) => {
    if (err) {
      console.error("Error saving disability:", err.message); // Log the error
      return res.status(500).json({ error: "Failed to save disability." });
    }

    res.status(200).json({ message: "Disability saved successfully." });
  });
});

  
// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://34.126.191.100:${PORT}`);
});
