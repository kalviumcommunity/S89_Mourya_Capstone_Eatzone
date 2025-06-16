import express from 'express';
import 'dotenv/config';

const app = express();
const port = 4002;

// Basic middleware
app.use(express.json());

// Test endpoint
app.get('/test', (req, res) => {
    console.log('Test endpoint hit!');
    res.json({ 
        message: 'Server is working!', 
        timestamp: new Date().toISOString(),
        port: port
    });
});

// Simple OAuth test endpoint
app.get('/api/admin/auth/google', (req, res) => {
    console.log('OAuth endpoint hit!');
    
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const serverUrl = `http://localhost:${port}`;
    
    if (!clientId) {
        return res.status(500).json({ error: 'Google Client ID not configured' });
    }
    
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(`${serverUrl}/api/admin/auth/google/callback`)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent('profile email')}&` +
        `access_type=offline&` +
        `prompt=select_account`;
    
    console.log('Redirecting to:', googleAuthUrl);
    res.redirect(googleAuthUrl);
});

// OAuth callback endpoint
app.get('/api/admin/auth/google/callback', (req, res) => {
    console.log('OAuth callback hit!');
    console.log('Query params:', req.query);
    
    res.json({
        message: 'OAuth callback received successfully!',
        query: req.query,
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(port, (err) => {
    if (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
    console.log(`✅ Test OAuth Server Started on http://localhost:${port}`);
    console.log(`🔗 Test OAuth URL: http://localhost:${port}/api/admin/auth/google`);
    console.log(`🔗 Test endpoint: http://localhost:${port}/test`);
});
