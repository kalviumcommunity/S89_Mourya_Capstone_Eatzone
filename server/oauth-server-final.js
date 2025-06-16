import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from the server directory
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const port = process.env.SERVER_PORT || 4000;

// Middleware
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
    credentials: true
}));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Test endpoint
app.get('/test', (req, res) => {
    console.log('✅ Test endpoint hit!');
    res.json({ 
        message: 'Server is working!', 
        timestamp: new Date().toISOString(),
        port: port,
        oauth: {
            clientId: process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Not configured',
            serverUrl: process.env.SERVER_URL || `http://localhost:${port}`
        }
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'Eatzone OAuth Server Running',
        endpoints: [
            '/test',
            '/api/user/auth/google',
            '/api/admin/auth/google'
        ]
    });
});

// User OAuth endpoint
app.get('/api/user/auth/google', (req, res) => {
    console.log('🔐 User OAuth endpoint hit!');
    
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const serverUrl = `http://localhost:${port}`;
    
    if (!clientId) {
        return res.status(500).json({ error: 'Google Client ID not configured' });
    }
    
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(`${serverUrl}/api/user/auth/google/callback`)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent('profile email')}&` +
        `access_type=offline&` +
        `prompt=select_account`;
    
    console.log('🔗 User OAuth redirect URL:', googleAuthUrl);
    res.redirect(googleAuthUrl);
});

// Admin OAuth endpoint
app.get('/api/admin/auth/google', (req, res) => {
    console.log('🔐 Admin OAuth endpoint hit!');
    
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
    
    console.log('🔗 Admin OAuth redirect URL:', googleAuthUrl);
    res.redirect(googleAuthUrl);
});

// User OAuth callback
app.get('/api/user/auth/google/callback', (req, res) => {
    console.log('✅ User OAuth callback hit!');
    console.log('Query params:', req.query);
    
    const { code, error } = req.query;
    
    if (error) {
        console.error('❌ OAuth error:', error);
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?authError=true`);
    }
    
    if (code) {
        console.log('✅ Authorization code received for user');
        // In a real implementation, you would exchange the code for tokens here
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?authSuccess=true&code=${code}`);
    } else {
        res.json({ 
            message: 'User OAuth callback received',
            query: req.query,
            timestamp: new Date().toISOString()
        });
    }
});

// Admin OAuth callback
app.get('/api/admin/auth/google/callback', (req, res) => {
    console.log('✅ Admin OAuth callback hit!');
    console.log('Query params:', req.query);
    
    const { code, error } = req.query;
    
    if (error) {
        console.error('❌ OAuth error:', error);
        return res.redirect(`${process.env.ADMIN_URL || 'http://localhost:5175'}/login?authError=true`);
    }
    
    if (code) {
        console.log('✅ Authorization code received for admin');
        // In a real implementation, you would exchange the code for tokens here
        res.redirect(`${process.env.ADMIN_URL || 'http://localhost:5175'}?authSuccess=true&code=${code}`);
    } else {
        res.json({ 
            message: 'Admin OAuth callback received',
            query: req.query,
            timestamp: new Date().toISOString()
        });
    }
});

// Error handling
app.use((err, req, res, next) => {
    console.error('❌ Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
const server = app.listen(port, (err) => {
    if (err) {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
    }
    
    console.log('🚀 ===============================================');
    console.log('🚀 EATZONE OAUTH SERVER STARTED SUCCESSFULLY!');
    console.log('🚀 ===============================================');
    console.log(`📍 Server URL: http://localhost:${port}`);
    console.log(`🔐 Google Client ID: ${process.env.GOOGLE_CLIENT_ID ? 'Configured ✅' : 'Not configured ❌'}`);
    console.log('');
    console.log('🔗 OAuth URLs:');
    console.log(`   👤 User:  http://localhost:${port}/api/user/auth/google`);
    console.log(`   👨‍💼 Admin: http://localhost:${port}/api/admin/auth/google`);
    console.log('');
    console.log('📋 Required Google Cloud Console Redirect URIs:');
    console.log(`   http://localhost:${port}/api/user/auth/google/callback`);
    console.log(`   http://localhost:${port}/api/admin/auth/google/callback`);
    console.log('🚀 ===============================================');
});

server.on('error', (err) => {
    console.error('❌ Server error:', err);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.close(() => {
        console.log('✅ Server shut down successfully');
        process.exit(0);
    });
});
