# EatZone Deployment Troubleshooting Guide

## Current Issue: Admin Page Not Loading Category Information

### Quick Diagnosis Steps

1. **Check Your Deployed Server URL**
   - Go to your Render dashboard
   - Find your EatZone backend service
   - Copy the actual deployed URL (it should be something like `https://your-app-name.onrender.com`)

2. **Update Environment Variables**
   - In your admin project, update `admin/.env`:
   ```
   VITE_API_BASE_URL=https://your-actual-render-url.onrender.com
   ```

3. **Test Server Connection**
   - Visit the debug page in your admin panel: `/debug`
   - This will show you exactly what's happening with your API calls

### Common Issues and Solutions

#### Issue 1: Wrong Server URL
**Symptoms:** Categories not loading, network errors in console
**Solution:** 
```bash
# Update admin/.env with correct URL
VITE_API_BASE_URL=https://your-actual-server-url.onrender.com

# Rebuild and redeploy admin
npm run build
```

#### Issue 2: Server Not Running
**Symptoms:** Connection timeout, server offline status
**Solution:**
- Check Render dashboard for server status
- Look at server logs for errors
- Ensure server is not sleeping (free tier limitation)

#### Issue 3: CORS Issues
**Symptoms:** CORS errors in browser console
**Solution:** Update server CORS configuration in `server/server.js`:
```javascript
app.use(cors({
    origin: [
        'http://localhost:5175',
        'https://your-admin-netlify-url.netlify.app',
        'https://eatzone1.netlify.app'
    ],
    credentials: true
}));
```

#### Issue 4: Database Not Connected
**Symptoms:** Server runs but API endpoints return errors
**Solution:**
- Check MongoDB connection string in Render environment variables
- Ensure database is accessible
- Run the default categories script: `npm run create-default-categories`

#### Issue 5: Missing Categories in Database
**Symptoms:** Empty categories list, "No categories found" message
**Solution:**
```bash
# SSH into your server or run locally
cd server
npm run create-default-categories
```

### Step-by-Step Fix Process

#### Step 1: Verify Server URL
1. Go to your Render dashboard
2. Find your backend service
3. Copy the URL (e.g., `https://eatzone-backend-xyz.onrender.com`)

#### Step 2: Update Admin Environment
```bash
# In admin/.env
VITE_API_BASE_URL=https://your-actual-server-url.onrender.com
```

#### Step 3: Test Connection
1. Go to admin panel → API Debug page (`/debug`)
2. Check all test results
3. Fix any failing tests

#### Step 4: Initialize Categories
If categories are missing:
```bash
# Option 1: Run script on server (if you have access)
npm run create-default-categories

# Option 2: Add categories manually through admin panel
# Go to Categories page and add them one by one
```

#### Step 5: Redeploy Admin
```bash
npm run build
# Deploy to Netlify
```

### Environment Variables Checklist

#### Server (Render)
```
MONGODB_URI=your_mongodb_connection_string
PORT=4000
NODE_ENV=production
FRONTEND_URL=https://eatzone1.netlify.app
ADMIN_URL=https://your-admin-netlify-url.netlify.app
```

#### Admin (Netlify)
```
VITE_API_BASE_URL=https://your-server-render-url.onrender.com
VITE_APP_ENV=production
VITE_CLOUDINARY_CLOUD_NAME=dodxdudew
```

#### Client (Netlify)
```
REACT_APP_API_URL=https://your-server-render-url.onrender.com
```

### Testing Your Fix

1. **Server Health Check**
   ```
   GET https://your-server-url.onrender.com/health
   ```
   Should return server status and configuration

2. **Categories Endpoint**
   ```
   GET https://your-server-url.onrender.com/api/category/list-all
   ```
   Should return categories array

3. **Admin Panel Test**
   - Go to Categories page
   - Should load without errors
   - Should show existing categories or "No categories found"

### Debug Information

Use the built-in debug page (`/debug` in admin panel) to get:
- Current API URL being used
- Server connection status
- CORS configuration
- Actual API responses
- Network error details

### Common Render Issues

1. **Free Tier Sleep Mode**
   - Free Render services sleep after 15 minutes of inactivity
   - First request after sleep takes 30+ seconds
   - Solution: Upgrade to paid tier or implement keep-alive

2. **Build Failures**
   - Check Render build logs
   - Ensure all dependencies are in package.json
   - Check Node.js version compatibility

3. **Environment Variables**
   - Set in Render dashboard, not in code
   - Restart service after changing variables

### Quick Commands

```bash
# Test server locally
cd server
npm start

# Test admin locally with production API
cd admin
npm run dev

# Create default categories
cd server
npm run create-default-categories

# Check server logs (if deployed)
# Go to Render dashboard → Your Service → Logs
```

### Contact Points for Help

If you're still having issues:
1. Check the debug page output
2. Look at browser console errors
3. Check Render service logs
4. Verify all environment variables are set correctly

The debug page will give you the most accurate information about what's failing in your specific deployment.
