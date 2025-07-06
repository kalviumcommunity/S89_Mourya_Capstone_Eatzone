import React,{useState} from 'react'
import './Home.css'
import Header from '../../components/Navbar/Header/Header'; //
import ExploreMenu from '../../components/Navbar/ExploreMenu/ExploreMenu';
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay';
import RestaurantList from '../../components/RestaurantList/RestaurantList';
import AppDownload from '../../components/AppDownload/AppDownload';
import FloatingChatbot from '../../components/FloatingChatbot/FloatingChatbot';

function Home() {
  console.log('🏠 Home component rendering...')

  const[category,setCategory]=useState("All");

  try {
    return (
      <div className="home-container">
        <Header />
        <RestaurantList />
        <ExploreMenu category={category} setCategory={setCategory}/>
        <FoodDisplay category={category}/>
        <AppDownload/>
        <FloatingChatbot />
      </div>
    );
  } catch (error) {
    console.error('❌ Error rendering Home component:', error)
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2 style={{ color: 'red' }}>Error loading home page</h2>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>Reload Page</button>
      </div>
    )
  }
}

export default Home