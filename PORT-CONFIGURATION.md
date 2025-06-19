# 🚀 Eatzone Port Configuration Guide

## 📋 Fixed Port Assignment

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| **Server** | `4000` | `http://localhost:4000` | Backend API server |
| **Client** | `5173` | `http://localhost:5173` | User frontend application |
| **Admin** | `5175` | `http://localhost:5175` | Admin dashboard |

## 🚨 Common Port Issues

### Problem: Client running on multiple ports (5173 and 5174)
**Cause:** Vite's `strictPort: false` allows auto port selection when 5173 is busy.

**Solution:** 
- Set `strictPort: true` in `client/vite.config.js`
- Kill any processes on wrong ports
- Restart with clean environment

### Problem: Google OAuth redirecting to wrong port
**Cause:** Multiple client instances running on different ports.

**Solution:**
- Ensure only one client instance on port 5173
- Google OAuth callbacks are configured for server port 4000
- Server redirects to correct frontend URL (5173)

## 🔧 Quick Fix Commands

### Windows:
```bash
# Run the automated fix script
fix-port-issues.bat

# Or manually:
taskkill /F /IM node.exe
cd client && npm run dev
cd admin && npm run dev
cd server && npm start
```

### Check Port Status:
```bash
node check-ports.js
```

## 🔐 Google OAuth Configuration

### Required Redirect URIs in Google Cloud Console:
```
http://localhost:4000/api/user/auth/google/callback
http://localhost:4000/api/admin/auth/google/callback
```

### OAuth Flow:
1. User clicks "Sign in with Google" on `http://localhost:5173`
2. Redirected to Google OAuth
3. Google redirects to `http://localhost:4000/api/user/auth/google/callback`
4. Server processes auth and redirects to `http://localhost:5173/auth/success`

## 🛠️ Configuration Files Updated

### `client/vite.config.js`:
```javascript
server: {
  port: 5173,
  strictPort: true, // ✅ Force port 5173
  host: true
}
```

### `admin/vite.config.js`:
```javascript
server: {
  port: 5175,
  strictPort: true, // ✅ Force port 5175
  host: true
}
```

### `server/server.js`:
```javascript
cors({
  origin: [
    'http://localhost:5173', // ✅ Client only
    'http://localhost:5175'  // ✅ Admin only
  ]
})
```

## 🚀 Correct Startup Sequence

1. **Start Server:** `cd server && npm start` (Port 4000)
2. **Start Client:** `cd client && npm run dev` (Port 5173)
3. **Start Admin:** `cd admin && npm run dev` (Port 5175)

## ✅ Verification Checklist

- [ ] Client accessible at `http://localhost:5173`
- [ ] Admin accessible at `http://localhost:5175`
- [ ] Server API at `http://localhost:4000`
- [ ] No services on ports 5174, 5176, 5177
- [ ] Google OAuth redirects to correct client URL
- [ ] CORS allows only correct origins

## 🔍 Troubleshooting

### If client still runs on wrong port:
1. Kill all Node processes: `taskkill /F /IM node.exe`
2. Check port availability: `netstat -an | findstr ":5173"`
3. Restart client: `cd client && npm run dev`

### If OAuth redirects to wrong URL:
1. Check server logs for redirect URL
2. Verify `FRONTEND_URL` environment variable
3. Ensure Google Console has correct callback URLs

### If CORS errors occur:
1. Check browser console for blocked origins
2. Verify server CORS configuration
3. Ensure client is on port 5173

## 📝 Environment Variables

```env
# Server (.env)
FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:5175

# Client (.env)
VITE_API_URL=http://localhost:4000

# Admin (.env)
VITE_API_URL=http://localhost:4000
```

---

**🎯 Goal:** Ensure consistent, predictable port usage across all Eatzone services for reliable Google OAuth and proper application functionality.
