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

// Register service worker for caching and offline support
if (process.env.NODE_ENV === 'production') {
  registerSW();
  requestNotificationPermission();
}
