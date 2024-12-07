const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the current directory
app.use(express.static(__dirname));

// Serve chatinterface.html for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'chatinterface.html'));
});

// Define the port
const PORT = process.env.PORT || 3030;

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
