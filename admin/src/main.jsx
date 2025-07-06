import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom"

// Ensure DOM is ready before initializing React
function initializeApp() {
  // Get root element
  const rootElement = document.getElementById('root')

  if (!rootElement) {
    console.error('❌ Root element not found')
    return
  }

  try {
    // Create root and render app with proper error handling
    const root = createRoot(rootElement)

    root.render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>
    )

    console.log('✅ Admin app initialized successfully')
  } catch (error) {
    console.error('❌ Failed to initialize admin app:', error)
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp)
} else {
  initializeApp()
}
