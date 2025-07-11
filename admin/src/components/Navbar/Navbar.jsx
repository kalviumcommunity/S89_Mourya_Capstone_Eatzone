import React from 'react'
import './Navbar.css'

const Navbar = ({ setSidebarOpen }) => {

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev)
  }

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <button 
            className="sidebar-toggle"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          
          <div className="navbar-brand">
            <h1>EatZone Admin</h1>
          </div>
        </div>

        <div className="navbar-right">
          <div className="admin-profile">
            <div className="admin-avatar">
              <span>A</span>
            </div>
            <span className="admin-name">Admin</span>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
