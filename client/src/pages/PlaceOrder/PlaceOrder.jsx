import React, { useContext, useState } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../context/StoreContext'
import { useNavigate } from 'react-router-dom'

const PlaceOrder = () => {
  const { getTotalCartAmount, clearCart, cartItems, food_list } = useContext(StoreContext)
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
  const navigate = useNavigate()

  // Handle form submission
  const handlePlaceOrder = async (e) => {
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
      // In a real app, you would send the order to your backend
      // For now, we'll simulate a successful order

      // Get order items from cart
      const orderItems = Object.keys(cartItems)
        .filter(id => cartItems[id] > 0)
        .map(id => {
          const item = food_list.find(food => food._id === id);
          return {
            id: item._id,
            name: item.name,
            price: item.price,
            quantity: cartItems[id],
            total: item.price * cartItems[id]
          };
        });

      // Create order object
      const order = {
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country
          }
        },
        items: orderItems,
        subtotal: getTotalCartAmount(),
        deliveryFee: 2,
        total: getTotalCartAmount() + 2,
        date: new Date().toISOString()
      };

      console.log('Order placed:', order);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Clear the cart after successful order
      await clearCart();

      // Show success message
      alert('Order placed successfully!');

      // Redirect to home page
      navigate('/');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('There was an error placing your order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form className='place-order'>
      <div className="place-order-left">
        <p className='title'>Delivery Information</p>
        <div className="multi-fields">
          <input
            type="text"
            placeholder='First name'
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder='Last name'
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            required
          />
        </div>
        <input
          type="email"
          placeholder='Email address'
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
        <input
          type="text"
          placeholder='Street'
          value={formData.street}
          onChange={(e) => setFormData({...formData, street: e.target.value})}
          required
        />
        <div className="multi-fields">
          <input
            type="text"
            placeholder='City'
            value={formData.city}
            onChange={(e) => setFormData({...formData, city: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder='State'
            value={formData.state}
            onChange={(e) => setFormData({...formData, state: e.target.value})}
            required
          />
        </div>
        <div className="multi-fields">
          <input
            type="text"
            placeholder='Zip code'
            value={formData.zipCode}
            onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder='Country'
            value={formData.country}
            onChange={(e) => setFormData({...formData, country: e.target.value})}
            required
          />
        </div>
        <input
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
              <p>₹{getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>{getTotalCartAmount()===0?0:2}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>₹{getTotalCartAmount()===0?0:getTotalCartAmount()+2}</b>
            </div>
          </div>
          <button
            type="button"
            onClick={handlePlaceOrder}
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