import React,{useState, useContext} from 'react'
import Navbar from './components/Navbar/Navbar'
import { Route, Routes, Navigate } from 'react-router-dom'
import Home from './pages/Home/Home'
import Cart from './pages/Cart/Cart'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import Profile from './pages/Profile/Profile'
import Orders from './pages/Orders/Orders'
import Footer from './components/Footer/Footer'
import LoginPopup from './components/LoginPopup/LoginPopup'
import AuthSuccess from './components/AuthSuccess/AuthSuccess'
import { StoreContext } from './context/StoreContext'

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
        <Route path='/auth/success' element={<AuthSuccess/>} />
        <Route path='/profile' element={
          <ProtectedRoute>
            <Profile/>
          </ProtectedRoute>
        } />
        <Route path='/orders' element={
          <ProtectedRoute>
            <Orders/>
          </ProtectedRoute>
        } />
       </Routes>
    </div>
    <Footer/>
    </>

  )
}

export default App