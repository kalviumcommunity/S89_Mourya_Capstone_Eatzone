import {useContext} from 'react'
import './FoodDisplay.css'
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';
import { SkeletonFoodItem } from '../Skeleton/Skeleton';

const FoodDisplay = ({category}) => {

    const {food_list, foodData, isFoodLoading} = useContext(StoreContext)

    // Use dynamic food data if available, otherwise fallback to static list, with proper fallback to empty array
    const displayFoodList = foodData && foodData.length > 0 ? foodData : (food_list || []);

  return (
    <div className='food-display' id='food-display'>
        <h2>Top dishes near you</h2>
        {isFoodLoading ? (
          <div className="skeleton-grid food-grid">
            {Array.from({ length: 8 }).map((_, index) => (
              <SkeletonFoodItem key={index} />
            ))}
          </div>
        ) : displayFoodList && displayFoodList.length > 0 ? (
          <div className='food-display-list'>
              {displayFoodList.map((item,index)=>{
                  if(category==="All" || category===item.category){
                    return <FoodItem
                      key={index}
                      id={item._id}
                      name={item.name}
                      description={item.description}
                      price={item.price}
                      image={item.image}
                      originalPrice={item.originalPrice}
                      discountPercentage={item.discountPercentage}
                      isOnSale={item.isOnSale}
                      discountLabel={item.discountLabel}
                      isPopular={item.isPopular}
                      isFeatured={item.isFeatured}
                      tags={item.tags}
                    />}else{return null}

              })}
          </div>
        ) : (
          <div style={{textAlign: 'center', padding: '40px 20px', color: '#666'}}>
            <div style={{fontSize: '48px', marginBottom: '16px'}}>🍽️</div>
            <h3 style={{margin: '0 0 8px 0', color: '#333'}}>No food items available</h3>
            <p style={{margin: '0', color: '#666'}}>Food items will appear here once they are added by the admin.</p>
          </div>
        )}
    </div>
  );
};

export default FoodDisplay