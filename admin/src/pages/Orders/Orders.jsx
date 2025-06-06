import { useEffect, useState, useCallback } from 'react';
import './Orders.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../../assets/assets';

// Currency conversion utilities
const USD_TO_INR_RATE = 83;
const convertUSDToINR = (usdAmount) => Math.round(usdAmount * USD_TO_INR_RATE);
const formatINR = (amount) => `₹${amount}`;

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([]);

  const fetchAllOrders = useCallback(async () => {
    try {
      const response = await axios.get(`${url}/api/order/list`);
      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        toast.error(response.data.message || 'Failed to load orders');
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || 'An error occurred while fetching orders');
    }
  }, [url]);

  const statusHandler = async(event,orderId) =>{
    const response = await axios.post(url+"/api/order/status",{orderId,status:event.target.value});
    if (response.data.success){
      toast.success("Status updated");
      fetchAllOrders();
    }
    else{
      toast.error("Failed to update status");
    }
  }

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  return (
    <div className="order add">
      <h3>Order page</h3>
      <div className="order-list">
        {orders.map((order, index) => (
          <div key={index} className="order-item">
            <img src={assets.parcel_icon} alt="" />
            <div>
              <p className="order-item-food">
                {order.items.map((item, index) => { 
                  if (index === order.items.length - 1) {
                    return item.name + ' x ' + item.quantity;
                  } else {
                    return item.name + ' x ' + item.quantity + ', ';
                  } }
                )}
              </p>
              <p className='order-item-name'>{order.address.firstName + ' ' + order.address.lastName}</p>
              <div className="order-item-address">
                <p>{order.address.street+","}</p>
                <p>{order.address.city+", "+order.address.state+", "+order.address.zipCode}</p>
              </div>
              <p className="order-item-phone">{order.address.phone}</p>
            </div>
            <p>Items : {order.items.length}</p>
            <p>{formatINR(convertUSDToINR(order.amount))}</p>
            <select onChange={(event)=>statusHandler(event,order._id)} value={order.status}>
              <option value="Food Processing">Food Processing</option>
              <option value="Out for delivery">Out for delivery</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;