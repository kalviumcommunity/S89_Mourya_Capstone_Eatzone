import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Import components
import Navbar from './components/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'

// Import pages
import Dashboard from './pages/Dashboard/Dashboard'
import Add from './pages/Add/Add'
import List from './pages/List/List'
import Orders from './pages/Orders/Orders'
import Analytics from './pages/Analytics/Analytics'
import Categories from './pages/Categories/Categories'
import DeliveryPartners from './pages/DeliveryPartners/DeliveryPartners'
import Feedback from './pages/Feedback/Feedback'
import AddRestaurant from './pages/AddRestaurant/AddRestaurant'
import RestaurantList from './pages/RestaurantList/RestaurantList'

const AdminApp = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Use environment variable for API URL with fallback
  const url = import.meta.env.VITE_API_BASE_URL || "https://eatzone.onrender.com"

  // Force direct admin access - no authentication
  console.log('🚀 EatZone Admin Panel v4.0 - NO LOGIN - Loaded Successfully!')
  console.log('✅ Login page has been completely removed')

  const handleMobileClose = () => {
    setIsMobileOpen(false)
    setSidebarOpen(false)
  }

  return (
    <div className="app">
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

      <Navbar setSidebarOpen={setSidebarOpen} />

      <div className="app-content">
        <Sidebar
          isOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isMobileOpen={isMobileOpen}
          onMobileClose={handleMobileClose}
        />

        <main className="main-content">
          <Routes>
            {/* Dashboard */}
            <Route path="/" element={<Dashboard url={url} />} />
            <Route path="/dashboard" element={<Dashboard url={url} />} />

            {/* Food Management */}
            <Route path="/add" element={<Add url={url} />} />
            <Route path="/list" element={<List url={url} />} />

            {/* Orders */}
            <Route path="/orders" element={<Orders url={url} />} />

            {/* Analytics */}
            <Route path="/analytics" element={<Analytics url={url} />} />

            {/* Categories */}
            <Route path="/categories" element={<Categories url={url} />} />

            {/* Delivery Partners */}
            <Route path="/delivery-partners" element={<DeliveryPartners url={url} />} />

            {/* Feedback */}
            <Route path="/feedback" element={<Feedback url={url} />} />

            {/* Restaurant Management */}
            <Route path="/add-restaurant" element={<AddRestaurant url={url} />} />
            <Route path="/restaurants" element={<RestaurantList url={url} />} />

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

const App = () => {
  return <AdminApp />
}

export default App
