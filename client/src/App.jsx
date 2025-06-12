import React,{useState, useContext} from 'react'
import Navbar from './components/Navbar/Navbar'
import { Route, Routes, Navigate } from 'react-router-dom'
import Home from './pages/Home/Home'
import Cart from './pages/Cart/Cart'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import Profile from './pages/Profile/Profile'
import Orders from './pages/Orders/Orders'
import Verify from './pages/Verify/Verify'
import Footer from './components/Footer/Footer'
import LoginPopup from './components/LoginPopup/LoginPopup'
import AuthSuccess from './components/AuthSuccess/AuthSuccess'
import { StoreContext } from './context/StoreContext'
import ChatbotPage from './pages/chatbot/ChatbotPage'

const App = () => {
  const [showLogin,setShowLogin] = useState(false)
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
    {showLogin?<LoginPopup setShowLogin={setShowLogin}/>:<></>}
    <div className='app'>
      <Navbar setShowLogin={setShowLogin}/>
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/cart' element={<Cart/>} />
        <Route path='/order' element={<PlaceOrder/>} />
        <Route path='/verify' element={<Verify/>}/>
        <Route path='/auth/*' element={<AuthSuccess/>} />
        <Route path='/myorders' element={
          <ProtectedRoute>
            <Orders/>
          </ProtectedRoute>
        } />
        <Route path='/profile' element={
          <ProtectedRoute>
            <Profile/>
          </ProtectedRoute>
        } />
        {/* Catch-all route for debugging */}
        <Route path='*' element={
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>Page Not Found</h2>
            <p>Current path: {window.location.pathname}</p>
            <p>Current search: {window.location.search}</p>
            <button onClick={() => window.location.href = '/'}>Go Home</button>
          </div>
        } />
        <Route
        path='/chatbot'
        element={<ChatbotPage/>}
        />
       </Routes>
    </div>
    <Footer/>
    </>

  )
}

export default App