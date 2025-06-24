import React, { useState, useEffect } from 'react';
import './Categories.css';
import { toast } from 'react-toastify';
import axios from 'axios';

const Categories = ({ url }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: null,
        order: 0,
        isActive: true
    });
    const [imagePreview, setImagePreview] = useState('');

    // Fetch all categories
    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${url}/api/category/list-all`);
            if (response.data.success) {
                setCategories(response.data.data);
            } else {
                toast.error("Failed to fetch categories");
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
            toast.error("Error fetching categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [url]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle image selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            image: null,
            order: 0,
            isActive: true
        });
        setImagePreview('');
        setEditingCategory(null);
    };

    // Open modal for adding new category
    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    // Open modal for editing category
    const openEditModal = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            image: null,
            order: category.order || 0,
            isActive: category.isActive
        });
        setImagePreview(category.image.startsWith('http') ? category.image : `${url}/images/${category.image}`);
        setShowModal(true);
    };

    // Close modal
    const closeModal = () => {
        setShowModal(false);
        resetForm();
    };

    // Submit form (add or edit)
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name.trim()) {
            toast.error("Category name is required");
            return;
        }

        if (!editingCategory && !formData.image) {
            toast.error("Category image is required");
            return;
        }

        try {
            setLoading(true);
            const submitData = new FormData();
            submitData.append('name', formData.name.trim());
            submitData.append('description', formData.description.trim());
            submitData.append('order', formData.order);
            submitData.append('isActive', formData.isActive);

            if (formData.image) {
                submitData.append('image', formData.image);
            }

            let response;
            if (editingCategory) {
                submitData.append('id', editingCategory._id);
                response = await axios.post(`${url}/api/category/update`, submitData);
            } else {
                response = await axios.post(`${url}/api/category/add`, submitData);
            }

            if (response.data.success) {
                toast.success(editingCategory ? "Category updated successfully!" : "Category added successfully!");
                fetchCategories();
                closeModal();
            } else {
                toast.error(response.data.message || "Operation failed");
            }
        } catch (error) {
            console.error("Error submitting category:", error);
            toast.error(error.response?.data?.message || "Error submitting category");
        } finally {
            setLoading(false);
        }
    };

    // Delete category
    const deleteCategory = async (categoryId) => {
        if (!window.confirm("Are you sure you want to delete this category?")) {
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(`${url}/api/category/remove`, { id: categoryId });
            
            if (response.data.success) {
                toast.success("Category deleted successfully!");
                fetchCategories();
            } else {
                toast.error("Failed to delete category");
            }
        } catch (error) {
            console.error("Error deleting category:", error);
            toast.error("Error deleting category");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="categories-container">
            <div className="categories-header">
                <h2>Food Categories Management</h2>
                <button className="add-btn" onClick={openAddModal}>
                    + Add New Category
                </button>
            </div>

            {loading && <div className="loading">Loading...</div>}

            <div className="categories-grid">
                {categories.map((category) => (
                    <div key={category._id} className={`category-card ${!category.isActive ? 'inactive' : ''}`}>
                        <div className="category-image">
                            <img 
                                src={category.image.startsWith('http') ? category.image : `${url}/images/${category.image}`}
                                alt={category.name}
                                onError={(e) => {
                                    e.target.src = '/placeholder-food.jpg';
                                }}
                            />
                        </div>
                        <div className="category-info">
                            <h3>{category.name}</h3>
                            <p>{category.description}</p>
                            <div className="category-meta">
                                <span>Order: {category.order}</span>
                                <span className={`status ${category.isActive ? 'active' : 'inactive'}`}>
                                    {category.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                        <div className="category-actions">
                            <button 
                                className="edit-btn"
                                onClick={() => openEditModal(category)}
                            >
                                Edit
                            </button>
                            <button 
                                className="delete-btn"
                                onClick={() => deleteCategory(category._id)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {categories.length === 0 && !loading && (
                <div className="no-categories">
                    <p>No categories found. Add your first category!</p>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
                            <button className="close-btn" onClick={closeModal}>×</button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="category-form">
                            <div className="form-group">
                                <label>Category Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter category name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter category description"
                                    rows="3"
                                />
                            </div>

                            <div className="form-group">
                                <label>Category Image {!editingCategory && '*'}</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                                {imagePreview && (
                                    <div className="image-preview">
                                        <img src={imagePreview} alt="Preview" />
                                    </div>
                                )}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Display Order</label>
                                    <input
                                        type="number"
                                        name="order"
                                        value={formData.order}
                                        onChange={handleInputChange}
                                        min="0"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={handleInputChange}
                                        />
                                        Active
                                    </label>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="button" onClick={closeModal} className="cancel-btn">
                                    Cancel
                                </button>
                                <button type="submit" className="submit-btn" disabled={loading}>
                                    {loading ? 'Saving...' : (editingCategory ? 'Update Category' : 'Add Category')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;
