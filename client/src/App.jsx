
import React, { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import LoginPopup from './components/LoginPopup/LoginPopup'

// Import the actual Home component
import Home from './pages/Home/Home'

const App = () => {
  const [showLogin, setShowLogin] = useState(false)

  return (
    <>
      {showLogin && <LoginPopup setShowLogin={setShowLogin} />}
      <div className='app'>
        <Navbar setShowLogin={setShowLogin} />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='*' element={<Home />} />
        </Routes>
        <Footer />
      </div>
    </>
  )
}

export default App
