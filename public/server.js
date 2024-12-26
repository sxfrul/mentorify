const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000; // Use port 3000 or environment variable port

// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // Serve static files from the current directory

// Serve the login page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "login.html"));
});

// Database connection
const db = mysql.createConnection({
    host: "34.126.191.100", // Replace with your MySQL host
    user: "root",           // Replace with your MySQL username
    password: "mentorify",  // Replace with your MySQL password
    database: "mentorify"   // Replace with your MySQL database name
});

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

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }

    const query = "SELECT * FROM users WHERE email = ?";
    db.query(query, [email], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Database query error." });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        const user = results[0];

        if (user.password !== password) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        res.json({ message: "Login successful", userId: user.id });
    });
});

// Signup API
app.post("/signup", (req, res) => {
    const { name, email, password, dob } = req.body;

    // Check if all fields are provided
    if (!name || !email || !password || !dob) {
        return res.status(400).json({ error: "All fields are required." });
    }

    // Insert the new user into the database
    const query = "INSERT INTO users (name, email, password, dob) VALUES (?, ?, ?, ?)";
    db.query(query, [name, email, password, dob], (err, results) => {
        if (err) {
            console.error("Error saving user:", err.message);
            return res.status(500).json({ error: "Failed to create user." });
        }

        // Send success response
        res.status(201).json({ message: "User created successfully.", userId: results.insertId });
    });
});

// Get user information by ID
app.get("/user/:id", (req, res) => {
    const userId = req.params.id;

    const query = "SELECT name, email, dob FROM users WHERE id = ?";
    db.query(query, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Database query error." });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "User not found." });
        }

        res.json(results[0]);
    });
});

// Save answer API
app.post("/save-answer", (req, res) => {
    const { userId, questionCategory, questionNumber, selectedAnswer } = req.body;

    if (!userId || !questionCategory || !questionNumber || !selectedAnswer) {
        return res.status(400).json({ error: "All fields are required." });
    }

    const query = `
        INSERT INTO user_answers (user_id, question_category, question_number, selected_answer)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE selected_answer = VALUES(selected_answer);
    `;
    db.query(query, [userId, questionCategory, questionNumber, selectedAnswer], (err) => {
        if (err) {
            return res.status(500).json({ error: "Failed to save answer." });
        }

        res.status(200).json({ message: "Answer saved successfully." });
    });
});

// Save or update user's disability
app.post("/save-disability", (req, res) => {
    const { userId, disability } = req.body;

    if (!userId || !disability) {
        return res.status(400).json({ error: "User ID and disability are required." });
    }

    const query = `
        INSERT INTO user_disabilities (user_id, disability)
        VALUES (?, ?) AS new_values
        ON DUPLICATE KEY UPDATE disability = new_values.disability;
    `;
    db.query(query, [userId, disability], (err) => {
        if (err) {
            return res.status(500).json({ error: "Failed to save disability." });
        }

        res.status(200).json({ message: "Disability saved successfully." });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
