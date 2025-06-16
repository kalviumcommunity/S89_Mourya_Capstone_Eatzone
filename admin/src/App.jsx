
import React from 'react'
import Sidebar from './components/Sidebar/Sidebar'
import Navbar from './components/Navbar/Navbar'
import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard/Dashboard'
import Add from './pages/Add/Add'
import List from './pages/List/List'
import Orders from './pages/Orders/Orders'
import Analytics from './pages/Analytics/Analytics'
import DeliveryPartners from './pages/DeliveryPartners/DeliveryPartners'
import Feedback from './pages/Feedback/Feedback'
// Removed authentication components - no longer needed
import { AdminProvider, useAdmin } from './context/AdminContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const AppContent = () => {
  const { url } = useAdmin();

  // No authentication required - directly show admin interface
  return (
    <div>
      <ToastContainer/>
      <Navbar/>
      <div className="app-content">
        <Sidebar/>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard url={url}/>}/>
          <Route path="/add" element={<Add url={url}/>}/>
          <Route path="/list" element={<List url={url}/>}/>
          <Route path="/orders" element={<Orders url={url}/>}/>
          <Route path="/analytics" element={<Analytics url={url}/>}/>
          <Route path="/delivery-partners" element={<DeliveryPartners url={url}/>}/>
          <Route path="/feedback" element={<Feedback url={url}/>}/>
          {/* Redirect any auth-related routes to dashboard */}
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="/auth/success" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AdminProvider>
      <AppContent />
    </AdminProvider>
  );
}

export default App