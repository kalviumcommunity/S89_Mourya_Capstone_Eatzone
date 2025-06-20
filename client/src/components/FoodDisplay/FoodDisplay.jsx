import {useContext} from 'react'
import './FoodDisplay.css'
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';

const FoodDisplay = ({category}) => {

    const {food_list, foodData, isFoodLoading} = useContext(StoreContext)

    // Use dynamic food data if available, otherwise fallback to static list
    const displayFoodList = foodData.length > 0 ? foodData : food_list;

  return (
    <div className='food-display' id='food-display'>
        <h2>Top dishes near you</h2>
        {isFoodLoading ? (
          <div className="loading">
            <p>Loading delicious food...</p>
          </div>
        ) : (
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
        )}
    </div>
  );
};

export default FoodDisplay