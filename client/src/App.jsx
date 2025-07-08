
import React, { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import LoginPopup from './components/LoginPopup/LoginPopup'

// Import the actual Home component
import Home from './pages/Home/Home'
import DiagnosticApp from './DiagnosticApp'
import SimpleHome from './SimpleHome'

const App = () => {
  const [showLogin, setShowLogin] = useState(false)

  return (
    <>
      {showLogin && <LoginPopup setShowLogin={setShowLogin} />}
      <div className='app'>
        <Navbar setShowLogin={setShowLogin} />
        <Routes>
          <Route path='/diagnostic' element={<DiagnosticApp />} />
          <Route path='/test' element={
            <div style={{ padding: '20px' }}>
              <h1>🍕 EatZone Test Page</h1>
              <p>This is a simple test page to verify routing works.</p>
              <a href="/diagnostic">Go to Diagnostic</a> | <a href="/">Go to Home</a>
            </div>
          } />
          <Route path='/simple' element={<SimpleHome />} />
          <Route path='/' element={<Home />} />
          <Route path='*' element={<Home />} />
        </Routes>
        <Footer />
      </div>
    </>
  )
}

export default App
