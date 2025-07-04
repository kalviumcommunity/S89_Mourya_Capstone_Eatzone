import React,{useState} from 'react'
import './Home.css'
import Header from '../../components/Navbar/Header/Header'; //
import ExploreMenu from '../../components/Navbar/ExploreMenu/ExploreMenu';
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay';
import RestaurantList from '../../components/RestaurantList/RestaurantList';
import AppDownload from '../../components/AppDownload/AppDownload';
import FloatingChatbot from '../../components/FloatingChatbot/FloatingChatbot';

function Home() {

  const[category,setCategory]=useState("All");

  return (
    <div>
      <Header />
      <RestaurantList />
      <ExploreMenu category={category} setCategory={setCategory}/>
      <FoodDisplay category={category}/>
      <AppDownload/>
      <FloatingChatbot />
    </div>
  );
}

export default Home