// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Endpoint to generate ephemeral tokens
app.post('/session', async (req, res) => {
  try {
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'realtime=v1'
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview-2024-12-17',
        voice: 'alloy' // You can change this to any available voice: alloy, echo, fable, onyx, nova, shimmer
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API Error:', errorText);
      return res.status(response.status).json({ 
        error: 'OpenAI API Error', 
        details: errorText 
      });
    }
    
    const data = await response.json();
    console.log('Session created:', data);
    res.json(data);
  } catch (error) {
    console.error('Error generating session token:', error);
    res.status(500).json({ error: 'Failed to generate session token', details: error.message });
  }
});

// Add a route to check API key validity
app.get('/check-api-key', async (req, res) => {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });
    const data = await response.json();
    res.json({
      status: response.status,
      valid: response.ok,
      models: response.ok ? data.data.length : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Open this URL in your browser to test the realtime chatbot');
});