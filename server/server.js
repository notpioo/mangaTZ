const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const dotenv = require('dotenv');
const mangaRoutes = require('./routes/manga');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/manga', mangaRoutes);

// Serve index.html for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});