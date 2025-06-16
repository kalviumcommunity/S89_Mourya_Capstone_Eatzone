import React, { useState, useEffect } from 'react';
import './Feedback.css';
import { toast } from 'react-toastify';

const Feedback = ({ url }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, resolved
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Mock feedback data - replace with actual API calls
  const mockFeedbacks = [
    {
      _id: '1',
      customerName: 'Rahul Sharma',
      customerEmail: 'rahul@example.com',
      orderId: 'ORD001',
      type: 'complaint',
      subject: 'Late Delivery',
      message: 'My order was delivered 45 minutes late. The food was cold when it arrived.',
      rating: 2,
      status: 'pending',
      priority: 'high',
      createdAt: '2024-01-15T10:30:00Z',
      resolvedAt: null,
      response: null,
      category: 'delivery'
    },
    {
      _id: '2',
      customerName: 'Priya Patel',
      customerEmail: 'priya@example.com',
      orderId: 'ORD002',
      type: 'feedback',
      subject: 'Great Service',
      message: 'Excellent food quality and fast delivery. Really impressed with the service!',
      rating: 5,
      status: 'resolved',
      priority: 'low',
      createdAt: '2024-01-14T15:20:00Z',
      resolvedAt: '2024-01-14T16:00:00Z',
      response: 'Thank you for your positive feedback! We appreciate your business.',
      category: 'service'
    },
    {
      _id: '3',
      customerName: 'Amit Kumar',
      customerEmail: 'amit@example.com',
      orderId: 'ORD003',
      type: 'complaint',
      subject: 'Wrong Order',
      message: 'I ordered chicken biryani but received vegetable biryani instead.',
      rating: 1,
      status: 'pending',
      priority: 'high',
      createdAt: '2024-01-13T12:45:00Z',
      resolvedAt: null,
      response: null,
      category: 'order'
    },
    {
      _id: '4',
      customerName: 'Sneha Reddy',
      customerEmail: 'sneha@example.com',
      orderId: 'ORD004',
      type: 'suggestion',
      subject: 'App Improvement',
      message: 'It would be great to have a feature to track delivery in real-time.',
      rating: 4,
      status: 'resolved',
      priority: 'medium',
      createdAt: '2024-01-12T09:15:00Z',
      resolvedAt: '2024-01-12T14:30:00Z',
      response: 'Thank you for the suggestion. We are working on implementing real-time tracking.',
      category: 'app'
    }
  ];

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      // For now, use mock data
      // TODO: Replace with actual API call
      // const response = await axios.get(`${url}/api/feedback`);
      setTimeout(() => {
        setFeedbacks(mockFeedbacks);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      toast.error('Failed to load feedbacks');
      setLoading(false);
    }
  };

  const handleStatusChange = async (feedbackId, newStatus, response = null) => {
    try {
      const updatedFeedbacks = feedbacks.map(feedback =>
        feedback._id === feedbackId
          ? { 
              ...feedback, 
              status: newStatus,
              resolvedAt: newStatus === 'resolved' ? new Date().toISOString() : null,
              response: response || feedback.response
            }
          : feedback
      );
      setFeedbacks(updatedFeedbacks);
      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleViewDetails = (feedback) => {
    setSelectedFeedback(feedback);
    setShowModal(true);
  };

  const handleRespond = async (feedbackId, response) => {
    try {
      await handleStatusChange(feedbackId, 'resolved', response);
      setShowModal(false);
      setSelectedFeedback(null);
    } catch (error) {
      console.error('Error responding to feedback:', error);
      toast.error('Failed to respond to feedback');
    }
  };

  const filteredFeedbacks = feedbacks.filter(feedback => {
    if (filter === 'all') return true;
    return feedback.status === filter;
  });

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'badge-warning',
      resolved: 'badge-success',
      in_progress: 'badge-info'
    };
    return `badge ${statusClasses[status] || 'badge-info'}`;
  };

  const getPriorityBadge = (priority) => {
    const priorityClasses = {
      high: 'badge-danger',
      medium: 'badge-warning',
      low: 'badge-success'
    };
    return `badge ${priorityClasses[priority] || 'badge-info'}`;
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'complaint':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        );
      case 'feedback':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
          </svg>
        );
      case 'suggestion':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        );
      default:
        return null;
    }
  };

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={index < rating ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        className={index < rating ? "star-filled" : "star-empty"}
      >
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
      </svg>
    ));
  };

  if (loading) {
    return (
      <div className="feedback">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback">
      <div className="page-header">
        <div>
          <h1>Feedback & Complaints</h1>
          <p>Manage customer feedback and resolve complaints</p>
        </div>
        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All ({feedbacks.length})
          </button>
          <button 
            className={filter === 'pending' ? 'active' : ''}
            onClick={() => setFilter('pending')}
          >
            Pending ({feedbacks.filter(f => f.status === 'pending').length})
          </button>
          <button 
            className={filter === 'resolved' ? 'active' : ''}
            onClick={() => setFilter('resolved')}
          >
            Resolved ({feedbacks.filter(f => f.status === 'resolved').length})
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon complaints">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div className="stat-info">
            <h3>{feedbacks.filter(f => f.type === 'complaint').length}</h3>
            <p>Complaints</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon feedback-positive">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
            </svg>
          </div>
          <div className="stat-info">
            <h3>{feedbacks.filter(f => f.type === 'feedback').length}</h3>
            <p>Positive Feedback</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon suggestions">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <div className="stat-info">
            <h3>{feedbacks.filter(f => f.type === 'suggestion').length}</h3>
            <p>Suggestions</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon average-rating">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
            </svg>
          </div>
          <div className="stat-info">
            <h3>{(feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)}</h3>
            <p>Average Rating</p>
          </div>
        </div>
      </div>

      {/* Feedback Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Customer Feedback</h3>
          <p className="card-subtitle">Review and respond to customer feedback</p>
        </div>
        
        <div className="feedback-table">
          <div className="table-header">
            <span>Customer</span>
            <span>Type</span>
            <span>Subject</span>
            <span>Rating</span>
            <span>Priority</span>
            <span>Status</span>
            <span>Date</span>
            <span>Actions</span>
          </div>
          
          {filteredFeedbacks.map((feedback) => (
            <div key={feedback._id} className="table-row">
              <div className="customer-info">
                <div className="customer-avatar">
                  {feedback.customerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4>{feedback.customerName}</h4>
                  <p>Order #{feedback.orderId}</p>
                </div>
              </div>
              
              <div className="type-info">
                {getTypeIcon(feedback.type)}
                <span className="type-label">{feedback.type}</span>
              </div>
              
              <div className="subject-info">
                <h4>{feedback.subject}</h4>
                <p>{feedback.message.substring(0, 50)}...</p>
              </div>
              
              <div className="rating-info">
                <div className="rating-stars">
                  {getRatingStars(feedback.rating)}
                </div>
                <span className="rating-value">{feedback.rating}/5</span>
              </div>
              
              <div className="priority-info">
                <span className={getPriorityBadge(feedback.priority)}>
                  {feedback.priority}
                </span>
              </div>
              
              <div className="status-info">
                <span className={getStatusBadge(feedback.status)}>
                  {feedback.status}
                </span>
              </div>
              
              <div className="date-info">
                <p>{new Date(feedback.createdAt).toLocaleDateString()}</p>
                <p>{new Date(feedback.createdAt).toLocaleTimeString()}</p>
              </div>
              
              <div className="actions">
                <button 
                  className="btn-icon view"
                  onClick={() => handleViewDetails(feedback)}
                  title="View Details"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
                {feedback.status === 'pending' && (
                  <button 
                    className="btn-icon resolve"
                    onClick={() => handleStatusChange(feedback._id, 'resolved')}
                    title="Mark as Resolved"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9,11 12,14 22,4"></polyline>
                      <path d="M21,12v7a2,2 0 0,1 -2,2H5a2,2 0 0,1 -2,-2V5a2,2 0 0,1 2,-2h11"></path>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback Detail Modal */}
      {showModal && selectedFeedback && (
        <FeedbackModal 
          feedback={selectedFeedback}
          onClose={() => {
            setShowModal(false);
            setSelectedFeedback(null);
          }}
          onRespond={handleRespond}
        />
      )}
    </div>
  );
};

// Feedback Detail Modal Component
const FeedbackModal = ({ feedback, onClose, onRespond }) => {
  const [response, setResponse] = useState(feedback.response || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (response.trim()) {
      onRespond(feedback._id, response);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal feedback-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Feedback Details</h3>
          <button className="modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="modal-content">
          <div className="feedback-details">
            <div className="detail-row">
              <label>Customer:</label>
              <span>{feedback.customerName} ({feedback.customerEmail})</span>
            </div>
            <div className="detail-row">
              <label>Order ID:</label>
              <span>{feedback.orderId}</span>
            </div>
            <div className="detail-row">
              <label>Type:</label>
              <span className="type-badge">{feedback.type}</span>
            </div>
            <div className="detail-row">
              <label>Subject:</label>
              <span>{feedback.subject}</span>
            </div>
            <div className="detail-row">
              <label>Rating:</label>
              <div className="rating-display">
                {Array.from({ length: 5 }, (_, index) => (
                  <svg
                    key={index}
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill={index < feedback.rating ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                    className={index < feedback.rating ? "star-filled" : "star-empty"}
                  >
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
                  </svg>
                ))}
                <span>({feedback.rating}/5)</span>
              </div>
            </div>
            <div className="detail-row">
              <label>Message:</label>
              <div className="message-content">{feedback.message}</div>
            </div>
            <div className="detail-row">
              <label>Date:</label>
              <span>{new Date(feedback.createdAt).toLocaleString()}</span>
            </div>
            <div className="detail-row">
              <label>Status:</label>
              <span className={`badge ${feedback.status === 'resolved' ? 'badge-success' : 'badge-warning'}`}>
                {feedback.status}
              </span>
            </div>
          </div>

          {feedback.status === 'pending' && (
            <form onSubmit={handleSubmit} className="response-form">
              <div className="form-group">
                <label className="form-label">Response:</label>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  className="form-textarea"
                  rows="4"
                  placeholder="Type your response here..."
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Send Response & Mark Resolved
                </button>
              </div>
            </form>
          )}

          {feedback.status === 'resolved' && feedback.response && (
            <div className="existing-response">
              <h4>Response:</h4>
              <div className="response-content">{feedback.response}</div>
              <p className="response-date">
                Resolved on {new Date(feedback.resolvedAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feedback;
