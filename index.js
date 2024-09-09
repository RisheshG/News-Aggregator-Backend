const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { admin, db } = require('./config/firebase');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Firebase Authentication Routes
app.post('/register', async (req, res) => {
  const { email, password, preferences } = req.body;
  try {
    const userRecord = await admin.auth().createUser({ email, password });
    await db.collection('users').doc(userRecord.uid).set({ email, preferences });
    res.status(201).json({ message: 'User registered successfully', user: userRecord });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    res.status(200).json({ message: 'User logged in successfully', user: userRecord });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// News Fetching Route
app.get('/news', async (req, res) => {
    const { apiKey, query } = req.query;
    if (!apiKey || !query) {
      return res.status(400).json({ error: 'apiKey and query parameters are required' });
    }
    
    try {
      const response = await axios.get(`https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&apiKey=${apiKey}`);
      res.status(200).json(response.data);
    } catch (error) {
      console.error('News fetching error:', error.message);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Start Server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));