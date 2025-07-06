import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import TestApp from './TestApp.jsx'
import { BrowserRouter } from 'react-router-dom'
import StoreContextProvider from './context/StoreContext.jsx'
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary.jsx'
import { registerSW, requestNotificationPermission } from './utils/serviceWorker'

// Ensure DOM is ready before initializing React
function initializeApp() {
  console.log('🚀 Starting EatZone app initialization...')

  // Get root element
  const rootElement = document.getElementById('root')

  if (!rootElement) {
    console.error('❌ Root element not found')
    return
  }

  console.log('✅ Root element found, creating React root...')

  try {
    // Create root and render app with proper error handling
    const root = createRoot(rootElement)

    console.log('✅ React root created, rendering app...')

    root.render(
      <ErrorBoundary>
        <BrowserRouter>
          <StoreContextProvider>
            <App />
          </StoreContextProvider>
        </BrowserRouter>
      </ErrorBoundary>
    )

    console.log('✅ EatZone app initialized successfully')
  } catch (error) {
    console.error('❌ Failed to initialize EatZone app:', error)
    // Show error on page
    document.body.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: Arial;">
        <h2 style="color: red;">EatZone Failed to Load</h2>
        <p>Error: ${error.message}</p>
        <button onclick="location.reload()">Reload Page</button>
      </div>
    `
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp)
} else {
  initializeApp()
}

// Register service worker for aggressive image caching and offline support
// Enable in both development and production for faster image loading
try {
  registerSW();
  if (import.meta.env.PROD) {
    requestNotificationPermission();
  }
} catch (error) {
  console.error('❌ Service worker registration failed:', error);
}
