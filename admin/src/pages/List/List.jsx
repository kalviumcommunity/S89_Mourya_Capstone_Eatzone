import React, { useEffect, useState } from 'react'
import './List.css'
import axios from "axios"
import {toast} from "react-toastify"

const List = ({url}) => {

  const [list,setList]= useState([]);

  const fetchList = async ()=>{
    try {
      // Show loading toast
      toast.info("Fetching food items...", { autoClose: 1000 });

      const response = await axios.get(`${url}/api/food/list`);

      if (response.data.success){
        setList(response.data.data);
        toast.success("Food items loaded successfully", { autoClose: 1000 });
      } else {
        toast.error(response.data.message || "Failed to load food items");
      }
    } catch (error) {
      console.error("Error fetching food list:", error);
      toast.error(error.response?.data?.message || "An error occurred while fetching food items");
    }
  }

  const removeFood = async(foodId)=>{
    try {
      // Show loading toast
      toast.info("Removing food item...", { autoClose: 1000 });

      const response = await axios.post(`${url}/api/food/remove`, { id: foodId });

      if (response.data.success){
        toast.success(response.data.message || "Food item removed successfully");
        // Refresh the list after successful removal
        await fetchList();
      } else {
        toast.error(response.data.message || "Failed to remove food item");
      }
    } catch (error) {
      console.error("Error removing food item:", error);
      toast.error(error.response?.data?.message || "An error occurred while removing the food item");
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchList();
  }, [])

  return (
    <div className='list add flex-col'>
      <p>All Foods List</p>
      <div className="list-table">
        <div className="list-table-format title">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Action</b>
        </div>
        {list.map((item,index)=>{
          return (
            <div key={index} className='list-table-format'>
              <img src={`${url}/images/`+item.image} alt="" />
              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>₹{item.price}</p>
              <p onClick={()=>removeFood(item._id)} className='cursor'>X</p>
            </div>
          )
        })}
      </div>

    </div>
  )
}

export default List