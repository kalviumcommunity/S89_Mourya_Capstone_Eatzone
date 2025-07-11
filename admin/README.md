# EatZone Admin Panel

A comprehensive admin dashboard for managing the EatZone food delivery platform.

## 🚀 Features

### ✅ Completed Features

- **📊 Dashboard Analytics** - Real-time statistics, revenue tracking, and key metrics
- **🍕 Food Management** - Complete CRUD operations for menu items with image upload
- **📦 Order Management** - Order tracking, status updates, and order history
- **🏷️ Category Management** - Dynamic category management with image support
- **🏪 Restaurant Management** - Restaurant CRUD operations with location and timing
- **📈 Analytics & Reporting** - Detailed sales reports and performance metrics
- **🚚 Delivery Partner Management** - Manage delivery partners and assignments
- **💬 Feedback Management** - Customer feedback and review management

### 🔄 In Progress

- **🔐 Authentication & Security** - Secure admin authentication with role-based access

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router DOM, Vite
- **Styling**: CSS3 with CSS Variables
- **HTTP Client**: Axios
- **Notifications**: React Toastify
- **Image Upload**: Cloudinary
- **Build Tool**: Vite

## 📦 Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env` file in the admin directory:
   ```env
   VITE_API_BASE_URL=https://eatzone.onrender.com
   VITE_APP_ENV=production
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```
   The admin panel will be available at `http://localhost:5175`

4. **Build for production**:
   ```bash
   npm run build
   ```

## 🌐 Deployment

### Option 1: Separate Netlify Site (Recommended)

1. **Create a new Netlify site**:
   - Go to Netlify dashboard
   - Click "Add new site" → "Deploy manually"
   - Drag and drop the `admin/dist` folder

2. **Or connect to GitHub**:
   - Connect your repository
   - Set build settings:
     - Base directory: `admin`
     - Build command: `npm run build`
     - Publish directory: `dist`

3. **Configure environment variables in Netlify**:
   ```
   VITE_API_BASE_URL=https://eatzone.onrender.com
   VITE_APP_ENV=production
   NODE_ENV=production
   ```

### Option 2: Add to Existing Client Routes

The admin panel can also be accessed via routes in the main client application at:
- `https://eatzone.netlify.app/admin` (redirects to separate admin site)

## 🎯 Admin Panel Features

### Dashboard
- **Real-time Statistics**: Orders, revenue, users, food items
- **Today's Metrics**: Daily orders and revenue
- **Weekly Analytics**: Week-over-week performance
- **Quick Stats**: Pending orders, delivered orders
- **Recent Orders**: Latest 10 orders with status
- **Top Food Items**: Most ordered items

### Food Management
- **Add New Items**: Complete form with image upload
- **Edit Items**: Update existing menu items
- **Delete Items**: Remove items from menu
- **Category Assignment**: Assign items to categories
- **Restaurant Assignment**: Link items to restaurants
- **Discount Management**: Set discounts and labels
- **Popular/Featured**: Mark items as popular or featured

### Order Management
- **Order Tracking**: Real-time order status updates
- **Status Management**: Update order status (Processing, Out for Delivery, Delivered)
- **Order Details**: View complete order information
- **Customer Information**: Access customer details
- **Order History**: Complete order timeline
- **Bulk Operations**: Handle multiple orders

### Category Management
- **CRUD Operations**: Create, read, update, delete categories
- **Image Upload**: Category images via Cloudinary
- **Dynamic Categories**: Real-time category updates
- **Category Assignment**: Link to food items

### Restaurant Management
- **Restaurant CRUD**: Complete restaurant management
- **Location Management**: Address and coordinates
- **Timing Management**: Operating hours
- **Menu Management**: Link food items to restaurants

### Analytics & Reporting
- **Sales Trends**: Revenue over time
- **Category Performance**: Sales by category
- **Order Statistics**: Completion rates, pending orders
- **Customer Analytics**: New vs returning customers
- **Top Performing Items**: Best-selling menu items
- **Revenue Breakdown**: Daily, weekly, monthly revenue

## 🔧 Configuration

### API Endpoints
The admin panel connects to these backend endpoints:
- `/api/order/list` - Get all orders
- `/api/order/status` - Update order status
- `/api/food/list` - Get all food items
- `/api/food/add` - Add new food item
- `/api/food/remove` - Delete food item
- `/api/category/list` - Get all categories
- `/api/restaurant/list` - Get all restaurants
- `/api/user/list` - Get all users (if available)

### Cloudinary Configuration
Images are uploaded to Cloudinary with these settings:
- Upload preset: `eatzone_admin`
- Folder structure: `eatzone/categories`, `eatzone/food`, `eatzone/restaurants`
- Supported formats: JPG, PNG, WebP
- Max file size: 5MB

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern Interface**: Clean, professional admin dashboard
- **Real-time Updates**: Live data refresh
- **Toast Notifications**: User feedback for all actions
- **Loading States**: Smooth loading indicators
- **Error Handling**: Comprehensive error management
- **Accessibility**: ARIA labels and keyboard navigation

## 🔒 Security Features

- **Environment Variables**: Secure API configuration
- **Input Validation**: Client-side form validation
- **Error Boundaries**: Graceful error handling
- **Secure Headers**: CSP and security headers
- **Image Validation**: File type and size validation

## 📱 Mobile Responsive

The admin panel is fully responsive and works seamlessly on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🚀 Performance

- **Optimized Build**: Vite build optimization
- **Code Splitting**: Lazy loading for better performance
- **Image Optimization**: Cloudinary automatic optimization
- **Caching**: Browser caching for static assets
- **Minification**: CSS and JS minification

## 📞 Support

For issues or questions regarding the admin panel:
1. Check the console for error messages
2. Verify API endpoint connectivity
3. Ensure environment variables are set correctly
4. Check Cloudinary configuration for image uploads

## 🔄 Updates

The admin panel is continuously updated with new features and improvements. Check the git history for the latest changes and updates.
