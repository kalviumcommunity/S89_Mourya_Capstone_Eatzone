// googleauth
import React,{ useContext, useState, useEffect } from 'react'
=======
import React,{ useContext, useState } from 'react'
// main
import './Navbar.css'
import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
// googleauth
import ProfileDropdown from '../ProfileDropdown/ProfileDropdown';
=======
// main

const Navbar = ({setShowLogin}) => {

    const [menu, setMenu] = useState("menu");

// googleauth
    const {getTotalCartAmount, token, user} = useContext(StoreContext);

=======
    const {getTotalCartAmount} = useContext(StoreContext);
    
// main
  return (
    <div className='navbar'>
      <Link to='/'><img src={assets.logo} alt="" className="logo" /></Link>
      <ul className='navbar-menu'>
        <Link to='/'onClick={()=>setMenu("Home")} className={menu==="Home"?"active":""}> Home</Link>
        <a href='#explore-menu' onClick={()=>setMenu("Menu")} className={menu==="Menu"?"active":""}> Menu</a>
        <a href='#app-download' onClick={()=>setMenu("Mobile-app")} className={menu==="Mobile-app"?"active":""}> Mobile-app</a>
        <a href='#footer' onClick={()=>setMenu("Contact-us")} className={menu==="Contact-us"?"active":""}> Contact us</a>
      </ul>
      <div className="navbar-right">
// googleauth
          <img src={assets.search_icon} alt="" />
          <div className="navbar-search-icon">
            <Link to="/cart"><img src={assets.basket_icon} alt="" /></Link>
            <div className={getTotalCartAmount()===0?"":"dot"}></div>
          </div>
          {token ? (
            <ProfileDropdown />
          ) : (
            <button onClick={()=>setShowLogin(true)}>Sign in</button>
          )}
        </div>
=======
        <img src={assets.search_icon} alt="" />
        <div className="navbar-search-icon">
          <Link to="/cart"><img src={assets.basket_icon} alt="" /></Link>
          <div className={getTotalCartAmount()===0?"":"dot"}></div>
        </div>
        <button onClick={()=>setShowLogin(true)}>Sign in</button>
      </div>      
// main
    </div>
  )
}

export default Navbar