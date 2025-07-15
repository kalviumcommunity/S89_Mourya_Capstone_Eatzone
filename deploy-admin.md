# Deploy Admin Panel to eatzone.netlify.app

## 🎯 Quick Deployment Steps

### Step 1: Build Admin Panel
```bash
cd admin
npm run build
```

### Step 2: Deploy to Netlify
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Find your `eatzone.netlify.app` site
3. Go to **Deploys** tab
4. Drag and drop the `admin/dist` folder to deploy

### Step 3: Configure Environment Variables
In Netlify site settings → Environment variables:
```
VITE_API_BASE_URL=https://eatzone.onrender.com
VITE_APP_ENV=production
NODE_ENV=production
```

### Step 4: Test Admin Panel
1. Visit: `https://eatzone.netlify.app/`
2. Admin panel provides direct access - no login required

## 🎉 Result
- **Customer App**: `https://eatzone1.netlify.app/`
- **Admin Panel**: `https://eatzone.netlify.app/`

## 🔧 Alternative: Create New Admin Site

If you prefer a dedicated admin URL:

1. **Create new site**:
   - Netlify Dashboard → "Add new site"
   - Deploy `admin/dist` folder
   - Choose name like `eatzone-admin`

2. **Result**:
   - **Customer App**: `https://eatzone1.netlify.app/`
   - **Admin Panel**: `https://eatzone-admin.netlify.app/`

Choose the option that works best for your setup!
