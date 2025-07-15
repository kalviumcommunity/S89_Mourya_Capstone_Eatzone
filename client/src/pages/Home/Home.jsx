import React,{useState} from 'react'
import './Home.css'
import Header from '../../components/Navbar/Header/Header'; //
import ExploreMenu from '../../components/Navbar/ExploreMenu/ExploreMenu';
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay';
import RestaurantList from '../../components/RestaurantList/RestaurantList';
import AppDownload from '../../components/AppDownload/AppDownload';
import FloatingChatbot from '../../components/FloatingChatbot/FloatingChatbot';
import TestCartFunctionality from '../../components/TestCartFunctionality/TestCartFunctionality';

function Home() {
  console.log('🏠 Home component rendering...')

  const[category,setCategory]=useState("All");

  return (
    <div className="home-container">
      <Header />
      <RestaurantList />
      <ExploreMenu category={category} setCategory={setCategory}/>
      <FoodDisplay category={category}/>
      <AppDownload/>
      <FloatingChatbot />
      <TestCartFunctionality />
    </div>
  );
}

export default Home