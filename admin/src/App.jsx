
import React, { useState, Suspense } from 'react'
import Sidebar from './components/Sidebar/Sidebar'
import Navbar from './components/Navbar/Navbar'
import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard/Dashboard'
import Add from './pages/Add/Add'
import List from './pages/List/List'
import Categories from './pages/Categories/Categories'
import AddRestaurant from './pages/AddRestaurant/AddRestaurant'
import RestaurantList from './pages/RestaurantList/RestaurantList'
import Orders from './pages/Orders/Orders'
import Analytics from './pages/Analytics/Analytics'
import DeliveryPartners from './pages/DeliveryPartners/DeliveryPartners'
import Feedback from './pages/Feedback/Feedback'
import ApiDebug from './components/Debug/ApiDebug'
// Removed authentication components - no longer needed
import { AdminProvider, useAdmin } from './context/AdminContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '18px',
    color: '#666'
  }}>
    Loading Admin Dashboard...
  </div>
);

const AppContent = () => {
  const { url } = useAdmin();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // No authentication required - directly show admin interface
  return (
    <div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Navbar onMobileMenuToggle={toggleMobileMenu}/>
      <div className="app-content">
        <Sidebar isMobileOpen={isMobileMenuOpen} onMobileClose={closeMobileMenu}/>
        <div className="main-content">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard url={url}/>}/>
              <Route path="/add" element={<Add url={url}/>}/>
              <Route path="/list" element={<List url={url}/>}/>
              <Route path="/categories" element={<Categories url={url}/>}/>
              <Route path="/add-restaurant" element={<AddRestaurant url={url}/>}/>
              <Route path="/restaurant-list" element={<RestaurantList url={url}/>}/>
              <Route path="/orders" element={<Orders url={url}/>}/>
              <Route path="/analytics" element={<Analytics url={url}/>}/>
              <Route path="/delivery-partners" element={<DeliveryPartners url={url}/>}/>
              <Route path="/feedback" element={<Feedback url={url}/>}/>
              <Route path="/debug" element={<ApiDebug />}/>
              {/* Redirect any auth-related routes to dashboard */}
              <Route path="/login" element={<Navigate to="/dashboard" replace />} />
              <Route path="/auth/success" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AdminProvider>
      <Suspense fallback={<LoadingSpinner />}>
        <AppContent />
      </Suspense>
    </AdminProvider>
  );
}

export default App