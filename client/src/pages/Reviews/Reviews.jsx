import React, { useContext, useState, useEffect } from 'react';
import { StoreContext } from '../../context/StoreContext';
import './Reviews.css';

const Reviews = () => {
  const { user, token } = useContext(StoreContext);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading reviews
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (!token) {
    return (
      <div className="reviews-container">
        <div className="no-auth-message">
          <div className="no-reviews-icon">🔒</div>
          <h3>Please Log In</h3>
          <p>You need to be logged in to view your reviews.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="reviews-container">
        <div className="reviews-header">
          <h1>My Reviews</h1>
          <p>Loading your reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reviews-container">
      <div className="reviews-header">
        <h1>My Reviews</h1>
        <p>Share your experience and help others discover great food!</p>
      </div>

      {reviews.length === 0 ? (
        <div className="no-reviews">
          <div className="no-reviews-icon">⭐</div>
          <h3>No Reviews Yet</h3>
          <p>You haven't written any reviews yet. Order some delicious food and share your experience!</p>
          <button 
            className="browse-food-btn"
            onClick={() => window.location.href = '/'}
          >
            Browse Food
          </button>
        </div>
      ) : (
        <div className="reviews-list">
          {reviews.map((review, index) => (
            <div key={index} className="review-card">
              <div className="review-header">
                <div className="restaurant-info">
                  <h3>{review.restaurantName}</h3>
                  <div className="rating">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`star ${i < review.rating ? 'filled' : ''}`}>
                        ⭐
                      </span>
                    ))}
                  </div>
                </div>
                <div className="review-date">
                  {new Date(review.date).toLocaleDateString()}
                </div>
              </div>
              
              <div className="review-content">
                <p>{review.comment}</p>
              </div>
              
              {review.foodItems && (
                <div className="reviewed-items">
                  <h4>Items Reviewed:</h4>
                  <div className="items-list">
                    {review.foodItems.map((item, idx) => (
                      <span key={idx} className="food-item">{item}</span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="review-actions">
                <button className="edit-review-btn">Edit Review</button>
                <button className="delete-review-btn">Delete Review</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;
