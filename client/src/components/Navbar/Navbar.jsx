import React, { useContext, useState, useEffect, useRef } from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import ProfileDropdown from '../ProfileDropdown/ProfileDropdown'
import { getImageUrl } from '../../utils/imageUtils';

const Navbar = ({setShowLogin}) => {

    const [menu, setMenu] = useState("menu");
    const {getTotalCartAmount, token, foodData, url, addToCart} = useContext(StoreContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [restaurants, setRestaurants] = useState([]);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    // Fetch restaurants for search
    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const response = await fetch(`${url}/api/restaurant/list`);
                const data = await response.json();
                if (data.success) {
                    setRestaurants(data.data);
                }
            } catch (error) {
                console.error('Error fetching restaurants:', error);
            }
        };
        fetchRestaurants();
    }, [url]);

    // Handle search functionality
    const handleSearch = (event) => {
        const query = event.target.value;
        setSearchQuery(query);

        if (query.trim() === '') {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        try {
            // Search in food items
            const foodResults = (foodData || []).filter(item =>
                item && item.name && item.category &&
                (item.name.toLowerCase().includes(query.toLowerCase()) ||
                item.category.toLowerCase().includes(query.toLowerCase()))
            ).slice(0, 5); // Limit to 5 results

            // Search in restaurants
            const restaurantResults = (restaurants || []).filter(restaurant =>
                restaurant && restaurant.name &&
                (restaurant.name.toLowerCase().includes(query.toLowerCase()) ||
                (restaurant.description && restaurant.description.toLowerCase().includes(query.toLowerCase())) ||
                (restaurant.cuisineTypes && restaurant.cuisineTypes.some(cuisine =>
                    cuisine && cuisine.toLowerCase().includes(query.toLowerCase())
                )))
            ).slice(0, 3); // Limit to 3 results

            setSearchResults([...foodResults, ...restaurantResults]);
            setShowSearchResults(true);
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
            setShowSearchResults(false);
        }
    };

    // Handle clicking outside search to close results
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearchResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Handle result click
    const handleResultClick = (item) => {
        if (item.address) {
            // It's a restaurant
            navigate(`/restaurant/${item._id}`);
        } else {
            // It's a food item - scroll to food display section
            navigate('/');
            setTimeout(() => {
                const foodSection = document.getElementById('food-display');
                if (foodSection) {
                    foodSection.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        }
        setSearchQuery('');
        setShowSearchResults(false);
    };

    // Handle Enter key press for search
    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && searchQuery.trim()) {
            // Navigate to home page and show all results
            navigate('/');
            setShowSearchResults(false);
            setTimeout(() => {
                const foodSection = document.getElementById('food-display');
                if (foodSection) {
                    foodSection.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        }
    };

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
          <div className="navbar-search" ref={searchRef}>
            <img src={assets.search_icon} alt="" />
            <input
              type="text"
              placeholder='Search for restaurants & food items'
              value={searchQuery}
              onChange={handleSearch}
              onKeyDown={handleKeyDown}
              onFocus={() => searchQuery && setShowSearchResults(true)}
            />

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="search-results-dropdown">
                {searchResults.map((item, index) => (
                  <div
                    key={index}
                    className="search-result-item"
                    onClick={() => handleResultClick(item)}
                  >
                    <img
                      src={getImageUrl(item.image, url)}
                      alt={item.name}
                      className="search-result-image"
                      onError={(e) => {
                        console.error("Failed to load search result image:", item.image);
                        e.target.src = "/api/placeholder/40/40";
                      }}
                    />
                    <div className="search-result-info">
                      <h4>{item.name}</h4>
                      <p>
                        {item.address ? (
                          <>
                            <span className="result-type">Restaurant</span>
                            <span className="result-detail">⭐ {item.rating} • {item.deliveryTime}</span>
                          </>
                        ) : (
                          <>
                            <span className="result-type">Food Item</span>
                            <span className="result-detail">{item.category} • ₹{item.price}</span>
                          </>
                        )}
                      </p>
                    </div>
                    {!item.address && (
                      <button
                        className="search-add-to-cart"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(item._id);
                        }}
                        title="Add to cart"
                      >
                        <img src={assets.add_icon_white} alt="Add to cart" />
                      </button>
                    )}
                  </div>
                ))}

                {searchQuery && (
                  <div className="search-result-footer">
                    <p>Press Enter or click to search more</p>
                  </div>
                )}
              </div>
            )}
          </div>

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
    </div>
  )
}

export default Navbar