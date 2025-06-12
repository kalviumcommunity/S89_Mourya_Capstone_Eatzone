import { useContext } from "react";
import "./Cart.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import { getImageUrl, handleImageError } from "../../utils/imageUtils";
import { formatINR } from "../../utils/currencyUtils";

const Cart = () => {
  const {
    cartItems,
    food_list,
    foodData,
    isFoodLoading,
    removeFromCart,
    getTotalCartAmount,
    clearCart,
    isCartLoading,
    token,
    url
  } = useContext(StoreContext);
  const navigate = useNavigate();

  return (
    <div className="cart">
      <div className="cart-items">
        <div className="cart-header">
          <div className="cart-items-title">
            <p>Items</p>
            <p>Title</p>
            <p>Price</p>
            <p>Quantity</p>
            <p>Total</p>
            <p>Remove</p>
          </div>
          {Object.keys(cartItems).some(id => cartItems[id] > 0) && (
            <button className="clear-cart-btn" onClick={clearCart}>
              Clear Cart
            </button>
          )}
        </div>
        <br />
        <hr />

        {isCartLoading || isFoodLoading ? (
          <div className="cart-loading">
            <p>Loading your cart...</p>
          </div>
        ) : null}

        {/* Render cart items using dynamic food data */}
        {Object.keys(cartItems).map((itemId) => {
          if (cartItems[itemId] > 0) {
            // Find item in dynamic food data first, then fallback to static list
            const item = foodData.find((product) => product._id === itemId) ||
                        food_list.find((product) => product._id === itemId);

            if (!item) {
              console.warn(`Item with ID ${itemId} not found in food data`);
              return null;
            }

            // Get proper image URL using utility function
            const imageUrl = getImageUrl(item.image, url);

            return (
              <div key={itemId}>
                <div className="cart-items-item">
                  <img
                    src={imageUrl}
                    alt={item.name}
                    onError={(e) => handleImageError(e, item.image)}
                  />
                  <p>{item.name}</p>
                  <p>{formatINR(item.price)}</p>
                  <p>{cartItems[itemId]}</p>
                  <p>{formatINR(item.price * cartItems[itemId])}</p>
                  <p onClick={() => removeFromCart(itemId)} className="cross">X</p>
                </div>
                <hr />
              </div>
            );
          }
          return null;
        })}
      </div>

      <div className="cart-bottom">
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
              <p>{formatINR(getTotalCartAmount() === 0 ? 0 : 50)}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>{formatINR(getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 50)}</b>
            </div>
          </div>
          <button
            onClick={() => {
              if (!token) {
                alert("Please sign in to proceed with checkout");
                return;
              }
              navigate('/order');
            }}
          >
            PROCEED TO CHECKOUT
          </button>
        </div>
        <div className="cart-promocode">
          <div>
            <p>If you have a promo code, Enter it here</p>
            <div className="cart-promocode-input">
              <input type="text" placeholder="promocode" />
              <button>Submit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
