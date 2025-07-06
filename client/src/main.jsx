import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import StoreContextProvider from './context/StoreContext.jsx'
import { registerSW, requestNotificationPermission } from './utils/serviceWorker'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <StoreContextProvider>
    <App />
  </StoreContextProvider>
  </BrowserRouter>,

)

// Register service worker for aggressive image caching and offline support
// Enable in both development and production for faster image loading
registerSW();
if (process.env.NODE_ENV === 'production') {
  requestNotificationPermission();
}
