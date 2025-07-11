
import React, { useState, useContext } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import LoginPopup from './components/LoginPopup/LoginPopup'
import { StoreContext } from './context/StoreContext'

// Import page components
import Home from './pages/Home/Home'
import Cart from './pages/Cart/Cart'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import Profile from './pages/Profile/Profile'
import Orders from './pages/Orders/Orders'
import Restaurant from './pages/Restaurant/Restaurant'
import Verify from './pages/Verify/Verify'
import AuthSuccess from './components/AuthSuccess/AuthSuccess'
import DiagnosticApp from './DiagnosticApp'
import SimpleHome from './SimpleHome'

const App = () => {
  const [showLogin, setShowLogin] = useState(false)
  const { token } = useContext(StoreContext)

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (!token) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <>
      {showLogin && <LoginPopup setShowLogin={setShowLogin} />}
      <div className='app'>
        <Navbar setShowLogin={setShowLogin} />
        <Routes>
          {/* Main pages */}
          <Route path='/' element={<Home />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/order' element={<PlaceOrder />} />
          <Route path='/restaurant/:id' element={<Restaurant />} />
          <Route path='/verify' element={<Verify />} />
          <Route path='/auth/*' element={<AuthSuccess />} />

          {/* Protected routes */}
          <Route path='/myorders' element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } />
          <Route path='/profile' element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          {/* Debug and test routes */}
          <Route path='/diagnostic' element={<DiagnosticApp />} />
          <Route path='/test' element={
            <div style={{ padding: '20px' }}>
              <h1>🍕 EatZone Test Page</h1>
              <p>This is a simple test page to verify routing works.</p>
              <a href="/diagnostic">Go to Diagnostic</a> | <a href="/">Go to Home</a>
            </div>
          } />
          <Route path='/simple' element={<SimpleHome />} />

          {/* Catch-all route */}
          <Route path='*' element={
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <h2>Page Not Found</h2>
              <p>The page you're looking for doesn't exist.</p>
              <button onClick={() => window.location.href = '/'}>Go Home</button>
            </div>
          } />
        </Routes>
        <Footer />
      </div>
    </>
  )
}

export default App
