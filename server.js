/* require('dotenv').config();
const { google } = require('googleapis');
const app = require('./app'); // Import the configured app

const port = 3000;

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000' // Ensure this matches your redirect URI
);

// Route to start the OAuth 2.0 flow
app.get('/auth', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/youtube.readonly'],
  });
  res.redirect(authUrl);
});

// Route to handle the OAuth 2.0 callback
app.get('/', async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send('Authorization code not found');
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    console.log('Access Token:', tokens.access_token);
    console.log('Refresh Token:', tokens.refresh_token);
    res.send('Authorization successful! You can close this window.');
  } catch (error) {
    console.error('Error retrieving access token:', error);
    res.status(500).send('Error retrieving access token');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); */

require('dotenv').config();
const express = require('express');
const { google } = require('googleapis');
const insightsRouter = require('./routes/insightsRoutes'); // Ensure this path is correct

const app = express();
const port = 3000;

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000' // Redirect URI is the root
);

// Use the insights router
app.use('/api/insights', insightsRouter);

// Route to start the OAuth 2.0 flow
app.get('/auth', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/youtube.readonly'],
  });
  res.redirect(authUrl);
});

// Handle the OAuth 2.0 callback at the root
app.get('/', async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send('Authorization code not found');
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    console.log('Access Token:', tokens.access_token);
    console.log('Refresh Token:', tokens.refresh_token);
    res.send('Authorization successful! You can close this window.');
  } catch (error) {
    console.error('Error retrieving access token:', error);
    res.status(500).send('Error retrieving access token');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});