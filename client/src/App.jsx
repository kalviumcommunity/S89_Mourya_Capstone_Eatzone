import React, { useState, useContext, Suspense, lazy, useEffect } from 'react'
import Navbar from './components/Navbar/Navbar'
import { Route, Routes, Navigate, useLocation } from 'react-router-dom'
import Footer from './components/Footer/Footer'
import LoginPopup from './components/LoginPopup/LoginPopup'
import { StoreContext } from './context/StoreContext'
import LazyWrapper from './components/LazyWrapper/LazyWrapper'
import { initializePreloader, useComponentPreloader } from './utils/preloader'
import { preloadCriticalImages } from './utils/imageUtils'
import { preloadImagesViaSW } from './utils/serviceWorker'
import { initializeImagePerformanceMonitoring } from './utils/imagePerformance'
import './utils/imageLoadTest' // Import for auto-testing in development

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home/Home'))
const Cart = lazy(() => import('./pages/Cart/Cart'))
const PlaceOrder = lazy(() => import('./pages/PlaceOrder/PlaceOrder'))
const Profile = lazy(() => import('./pages/Profile/Profile'))
const Orders = lazy(() => import('./pages/Orders/Orders'))
const Restaurant = lazy(() => import('./pages/Restaurant/Restaurant'))
const Verify = lazy(() => import('./pages/Verify/Verify'))
const AuthSuccess = lazy(() => import('./components/AuthSuccess/AuthSuccess'))
const ChatbotPage = lazy(() => import('./pages/chatbot/ChatbotPage'))
const DebugPanel = lazy(() => import('./components/DebugPanel/DebugPanel'))
const ImageDebug = lazy(() => import('./pages/ImageDebug/ImageDebug'))

const App = () => {
  const [showLogin,setShowLogin] = useState(false)
  const { token } = useContext(StoreContext)
  const location = useLocation()
  const { preloadByRoute } = useComponentPreloader()

  // Initialize preloader and handle aggressive image preloading
  useEffect(() => {
    initializePreloader()

    // Initialize image performance monitoring
    initializeImagePerformanceMonitoring()

    // Preload critical images for faster loading using multiple strategies
    preloadCriticalImages()

    // Also preload via service worker for persistent caching
    const criticalImageUrls = [
      'https://res.cloudinary.com/dodxdudew/image/upload/f_auto,q_auto:good,w_400,h_300,c_fill,fl_progressive,fl_awebp,dpr_auto/v1735055000/eatzone/categories/default-food.jpg',
      'https://res.cloudinary.com/dodxdudew/image/upload/f_auto,q_auto:good,w_200,h_200,c_fill,fl_progressive,fl_awebp,dpr_auto/v1735055000/eatzone/categories/pizza.jpg',
      'https://res.cloudinary.com/dodxdudew/image/upload/f_auto,q_auto:good,w_200,h_200,c_fill,fl_progressive,fl_awebp,dpr_auto/v1735055000/eatzone/categories/burgers.jpg',
      'https://res.cloudinary.com/dodxdudew/image/upload/f_auto,q_auto:good,w_200,h_200,c_fill,fl_progressive,fl_awebp,dpr_auto/v1735055000/eatzone/categories/desserts.jpg'
    ];

    // Preload via service worker after a short delay to avoid blocking initial render
    setTimeout(() => {
      preloadImagesViaSW(criticalImageUrls).catch(error => {
        console.log('Service worker preloading not available, using fallback method');
      });
    }, 500);
  }, [])

  // Preload components based on current route
  useEffect(() => {
    preloadByRoute(location.pathname)
  }, [location.pathname, preloadByRoute])

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
        <Route path='/' element={
          <LazyWrapper skeletonType="page" skeletonCount={3}>
            <Home/>
          </LazyWrapper>
        } />
        <Route path='/cart' element={
          <LazyWrapper skeletonType="minimal">
            <Cart/>
          </LazyWrapper>
        } />
        <Route path='/order' element={
          <LazyWrapper skeletonType="minimal">
            <PlaceOrder/>
          </LazyWrapper>
        } />
        <Route path='/restaurant/:id' element={
          <LazyWrapper skeletonType="page" skeletonCount={6}>
            <Restaurant/>
          </LazyWrapper>
        } />
        <Route path='/verify' element={
          <LazyWrapper skeletonType="minimal">
            <Verify/>
          </LazyWrapper>
        }/>
        <Route path='/auth/*' element={
          <LazyWrapper skeletonType="minimal">
            <AuthSuccess/>
          </LazyWrapper>
        } />
        <Route path='/myorders' element={
          <ProtectedRoute>
            <LazyWrapper skeletonType="page" skeletonCount={4}>
              <Orders/>
            </LazyWrapper>
          </ProtectedRoute>
        } />
        <Route path='/profile' element={
          <ProtectedRoute>
            <LazyWrapper skeletonType="minimal">
              <Profile/>
            </LazyWrapper>
          </ProtectedRoute>
        } />
        <Route path='/chatbot' element={
          <LazyWrapper skeletonType="minimal">
            <ChatbotPage/>
          </LazyWrapper>
        } />
        <Route path='/debug-images' element={
          <LazyWrapper skeletonType="minimal">
            <ImageDebug/>
          </LazyWrapper>
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
       </Routes>
    </div>
    <Footer/>
    {/* Debug panel for development */}
    {process.env.NODE_ENV === 'development' && (
      <Suspense fallback={null}>
        <DebugPanel />
      </Suspense>
    )}
    </>

  )
}

export default App