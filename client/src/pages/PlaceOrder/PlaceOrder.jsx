import { useContext, useState } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios'
import { formatINR } from '../../utils/currencyUtils'

const PlaceOrder = () => {
  const { getTotalCartAmount, cartItems, food_list, foodData, url, token, user } = useContext(StoreContext)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: ''
  })



  const [isProcessing, setIsProcessing] = useState(false)

  // Handle form submission
  const handlePlaceOrder = async () => {
    // Check if user is logged in
    if (!token) {
      alert('Please login to place an order!');
      return;
    }

    // Check if cart is empty
    if (getTotalCartAmount() === 0) {
      alert('Your cart is empty!');
      return;
    }

    // Validate form
    const form = document.querySelector('.place-order');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setIsProcessing(true);

    try {
      // Get order items from cart
      const orderItems = Object.keys(cartItems)
        .filter(id => cartItems[id] > 0)
        .map(id => {
          // First try to find in dynamic food data, then fallback to static list
          const item = foodData.find(food => food._id === id) ||
                      food_list.find(food => food._id === id);
          if (!item) {
            throw new Error(`Food item with ID ${id} not found`);
          }
          return {
            _id: item._id,
            name: item.name,
            price: item.price,
            quantity: cartItems[id]
          };
        });

      // Check if user data is available
      if (!user || (!user.id && !user._id)) {
        alert('User information not available. Please try logging in again.');
        return;
      }

      // Create order data for API
      const orderData = {
        userId: user.id || user._id,
        items: orderItems,
        amount: getTotalCartAmount() + 50, // Include delivery fee
        address: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        }
      };

      console.log('Sending order data:', orderData);

      // Send order to backend
      const response = await axios.post(`${url}/api/order/place`, orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Order response:', response.data);

      if (response.data.success) {
        // Redirect to Stripe payment page
        window.location.href = response.data.session_url;
      } else {
        alert('Failed to create order: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error placing order:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        alert('Error: ' + (error.response.data.message || 'Failed to place order'));
      } else {
        alert('There was an error placing your order. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handlePlaceOrder(); }} className='place-order'>
      <div className="place-order-left">
        <p className='title'>Delivery Information</p>
        <div className="multi-fields">
          <input
            name="firstName"
            type="text"
            placeholder='First name'
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            required
          />
          <input
            name="lastName"
            type="text"
            placeholder='Last name'
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            required
          />
        </div>
        <input
          name="email"
          type="email"
          placeholder="Email address"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
        <input
          name="street"
          type="text"
          placeholder='Street'
          value={formData.street}
          onChange={(e) => setFormData({...formData, street: e.target.value})}
          required
        />
        <div className="multi-fields">
          <input
            name="city"
            type="text"
            placeholder='City'
            value={formData.city}
            onChange={(e) => setFormData({...formData, city: e.target.value})}
            required
          />
          <input
            name="state"
            type="text"
            placeholder='State'
            value={formData.state}
            onChange={(e) => setFormData({...formData, state: e.target.value})}
            required
          />
        </div>
        <div className="multi-fields">
          <input
            name="zipCode"
            type="text"
            placeholder='Zip code'
            value={formData.zipCode}
            onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
            required
          />
          <input
            name="country"
            type="text"
            placeholder='Country'
            value={formData.country}
            onChange={(e) => setFormData({...formData, country: e.target.value})}
            required
          />
        </div>
        <input
          name="phone"
          type="text"
          placeholder='Phone'
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          required
        />
      </div>
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
               <div className="cart-total-details">
              <p>Subtotal</p>
              <p>{formatINR(getTotalCartAmount())}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>{formatINR(getTotalCartAmount()===0?0:50)}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>{formatINR(getTotalCartAmount()===0?0:getTotalCartAmount()+50)}</b>
            </div>
          </div>
          <div style={{
            fontSize: '12px',
            color: '#666',
            marginTop: '10px',
            padding: '8px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            textAlign: 'center'
          }}>
            💳 Payments are processed securely in INR (₹) through Stripe
          </div>
          <button
            type="submit"
            disabled={isProcessing}
          >
            {isProcessing ? 'PROCESSING...' : 'PROCEED TO PAYMENT'}
          </button>
        </div>
      </div>
    </form>
  )
}

export default PlaceOrder