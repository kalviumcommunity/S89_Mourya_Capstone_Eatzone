import React, { useState, useEffect } from 'react';
import './DeliveryPartners.css';
import { toast } from 'react-toastify';

const DeliveryPartners = ({ url }) => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    vehicleType: 'bike',
    vehicleNumber: '',
    status: 'available'
  });

  // Mock data for now - replace with actual API calls
  const mockPartners = [
    {
      _id: '1',
      name: 'Rajesh Kumar',
      phone: '+91 9876543210',
      email: 'rajesh@eatzone.com',
      vehicleType: 'bike',
      vehicleNumber: 'MH12AB1234',
      status: 'available',
      assignedOrders: 0,
      completedOrders: 45,
      rating: 4.8,
      joinDate: '2024-01-15'
    },
    {
      _id: '2',
      name: 'Priya Sharma',
      phone: '+91 9876543211',
      email: 'priya@eatzone.com',
      vehicleType: 'scooter',
      vehicleNumber: 'MH12CD5678',
      status: 'busy',
      assignedOrders: 2,
      completedOrders: 67,
      rating: 4.9,
      joinDate: '2024-02-20'
    },
    {
      _id: '3',
      name: 'Amit Patel',
      phone: '+91 9876543212',
      email: 'amit@eatzone.com',
      vehicleType: 'bike',
      vehicleNumber: 'MH12EF9012',
      status: 'offline',
      assignedOrders: 0,
      completedOrders: 23,
      rating: 4.6,
      joinDate: '2024-03-10'
    },
    {
      _id: '4',
      name: 'Sneha Reddy',
      phone: '+91 9876543213',
      email: 'sneha@eatzone.com',
      vehicleType: 'scooter',
      vehicleNumber: 'MH12GH3456',
      status: 'available',
      assignedOrders: 0,
      completedOrders: 89,
      rating: 4.7,
      joinDate: '2024-01-05'
    }
  ];

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      // For now, use mock data
      // TODO: Replace with actual API call
      // const response = await axios.get(`${url}/api/delivery-partners`);
      setTimeout(() => {
        setPartners(mockPartners);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching delivery partners:', error);
      toast.error('Failed to load delivery partners');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPartner) {
        // Update partner
        const updatedPartners = partners.map(partner =>
          partner._id === editingPartner._id
            ? { ...partner, ...formData }
            : partner
        );
        setPartners(updatedPartners);
        toast.success('Partner updated successfully');
      } else {
        // Add new partner
        const newPartner = {
          _id: Date.now().toString(),
          ...formData,
          assignedOrders: 0,
          completedOrders: 0,
          rating: 0,
          joinDate: new Date().toISOString().split('T')[0]
        };
        setPartners(prev => [...prev, newPartner]);
        toast.success('Partner added successfully');
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving partner:', error);
      toast.error('Failed to save partner');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      vehicleType: 'bike',
      vehicleNumber: '',
      status: 'available'
    });
    setShowAddModal(false);
    setEditingPartner(null);
  };

  const handleEdit = (partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      phone: partner.phone,
      email: partner.email,
      vehicleType: partner.vehicleType,
      vehicleNumber: partner.vehicleNumber,
      status: partner.status
    });
    setShowAddModal(true);
  };

  const handleDelete = async (partnerId) => {
    if (window.confirm('Are you sure you want to delete this partner?')) {
      try {
        setPartners(prev => prev.filter(partner => partner._id !== partnerId));
        toast.success('Partner deleted successfully');
      } catch (error) {
        console.error('Error deleting partner:', error);
        toast.error('Failed to delete partner');
      }
    }
  };

  const handleStatusChange = async (partnerId, newStatus) => {
    try {
      const updatedPartners = partners.map(partner =>
        partner._id === partnerId
          ? { ...partner, status: newStatus }
          : partner
      );
      setPartners(updatedPartners);
      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      available: 'badge-success',
      busy: 'badge-warning',
      offline: 'badge-danger'
    };
    return `badge ${statusClasses[status] || 'badge-info'}`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return <div className="status-dot available"></div>;
      case 'busy':
        return <div className="status-dot busy"></div>;
      case 'offline':
        return <div className="status-dot offline"></div>;
      default:
        return <div className="status-dot"></div>;
    }
  };

  if (loading) {
    return (
      <div className="delivery-partners">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading delivery partners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="delivery-partners">
      <div className="page-header">
        <div>
          <h1>Delivery Partners</h1>
          <p>Manage your delivery team and track their performance</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          Add Partner
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon available">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className="stat-info">
            <h3>{partners.filter(p => p.status === 'available').length}</h3>
            <p>Available</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon busy">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12,6 12,12 16,14"></polyline>
            </svg>
          </div>
          <div className="stat-info">
            <h3>{partners.filter(p => p.status === 'busy').length}</h3>
            <p>Busy</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon offline">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
            </svg>
          </div>
          <div className="stat-info">
            <h3>{partners.filter(p => p.status === 'offline').length}</h3>
            <p>Offline</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon total">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className="stat-info">
            <h3>{partners.length}</h3>
            <p>Total Partners</p>
          </div>
        </div>
      </div>

      {/* Partners Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">All Delivery Partners</h3>
          <p className="card-subtitle">Manage and monitor your delivery team</p>
        </div>
        
        <div className="partners-table">
          <div className="table-header">
            <span>Partner</span>
            <span>Contact</span>
            <span>Vehicle</span>
            <span>Status</span>
            <span>Orders</span>
            <span>Rating</span>
            <span>Actions</span>
          </div>
          
          {partners.map((partner) => (
            <div key={partner._id} className="table-row">
              <div className="partner-info">
                <div className="partner-avatar">
                  {partner.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4>{partner.name}</h4>
                  <p>Joined {new Date(partner.joinDate).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="contact-info">
                <p>{partner.phone}</p>
                <p>{partner.email}</p>
              </div>
              
              <div className="vehicle-info">
                <p>{partner.vehicleType.charAt(0).toUpperCase() + partner.vehicleType.slice(1)}</p>
                <p>{partner.vehicleNumber}</p>
              </div>
              
              <div className="status-info">
                {getStatusIcon(partner.status)}
                <select 
                  value={partner.status}
                  onChange={(e) => handleStatusChange(partner._id, e.target.value)}
                  className="status-select"
                >
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
              
              <div className="orders-info">
                <p>Active: {partner.assignedOrders}</p>
                <p>Completed: {partner.completedOrders}</p>
              </div>
              
              <div className="rating-info">
                <div className="rating">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
                  </svg>
                  {partner.rating}
                </div>
              </div>
              
              <div className="actions">
                <button 
                  className="btn-icon edit"
                  onClick={() => handleEdit(partner)}
                  title="Edit Partner"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button 
                  className="btn-icon delete"
                  onClick={() => handleDelete(partner._id)}
                  title="Delete Partner"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3,6 5,6 21,6"></polyline>
                    <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingPartner ? 'Edit Partner' : 'Add New Partner'}</h3>
              <button className="modal-close" onClick={resetForm}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Vehicle Type *</label>
                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    <option value="bike">Bike</option>
                    <option value="scooter">Scooter</option>
                    <option value="car">Car</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Vehicle Number *</label>
                  <input
                    type="text"
                    name="vehicleNumber"
                    value={formData.vehicleNumber}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingPartner ? 'Update Partner' : 'Add Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryPartners;
