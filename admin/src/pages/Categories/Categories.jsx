import React, { useState, useEffect } from 'react';
import './Categories.css';
import { toast } from 'react-toastify';
import axios from 'axios';

// Cloudinary upload function for category images
const uploadToCloudinary = async (file, folder = 'eatzone/categories') => {
    try {
        if (!file) {
            throw new Error('No file provided');
        }

        if (!file.type.startsWith('image/')) {
            throw new Error('Only image files are allowed');
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            throw new Error('File size must be less than 5MB');
        }

        console.log('Uploading category image to Cloudinary:', {
            name: file.name,
            size: file.size,
            type: file.type,
            folder: folder
        });

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'eatzone_admin');
        formData.append('folder', folder);
        formData.append('tags', 'category,menu');

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/dodxdudew/image/upload`,
            {
                method: 'POST',
                body: formData
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Cloudinary upload error:', errorData);
            throw new Error(errorData.error?.message || `Upload failed with status ${response.status}`);
        }

        const result = await response.json();
        console.log('Cloudinary upload successful:', result);

        return {
            success: true,
            url: result.secure_url,
            publicId: result.public_id
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Helper function to get proper image URL for admin display
const getCategoryImageUrl = (imageUrl, baseUrl) => {
    if (!imageUrl) return getDefaultCategoryImage('default');

    // If it's already a full URL (Cloudinary), use it directly
    if (imageUrl.startsWith('http')) {
        return imageUrl;
    }

    // If it's a local file, construct the full URL
    return `${baseUrl}/images/${imageUrl}`;
};

// Helper function to get default category images
const getDefaultCategoryImage = (categoryName) => {
    const defaultImages = {
        'Rolls': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/rolls.jpg',
        'Salad': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/salad.jpg',
        'Deserts': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/desserts.jpg',
        'Sandwich': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/sandwich.jpg',
        'Cake': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/cake.jpg',
        'Veg': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/veg.jpg',
        'Pizza': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/pizza.jpg',
        'Pasta': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/pasta.jpg',
        'Noodles': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/noodles.jpg',
        'Main Course': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/main-course.jpg',
        'Appetizer': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/appetizer.jpg',
        'Sushi': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/sushi.jpg',
        'default': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/default-food.jpg'
    };

    return defaultImages[categoryName] || defaultImages['default'];
};

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
    const [cloudinaryUrl, setCloudinaryUrl] = useState('');
    const [imageUploading, setImageUploading] = useState(false);

    // Fetch all categories
    const fetchCategories = async () => {
        try {
            setLoading(true);
            console.log("🔄 Fetching categories from:", `${url}/api/category/list-all`);

            const response = await axios.get(`${url}/api/category/list-all`, {
                timeout: 10000,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            console.log("📦 Categories response:", response);

            if (response.data.success) {
                setCategories(response.data.data);
                console.log("✅ Categories loaded successfully:", response.data.data.length, "categories");
                if (response.data.data.length === 0) {
                    toast.info("No categories found. You can add your first category!");
                }
            } else {
                console.error("❌ API returned error:", response.data.message);
                toast.error(`Failed to fetch categories: ${response.data.message}`);
            }
        } catch (error) {
            console.error("❌ Error fetching categories:", error);

            if (error.code === 'ECONNABORTED') {
                toast.error("Request timeout - Server might be slow or unreachable");
            } else if (error.response) {
                toast.error(`Server error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
            } else if (error.request) {
                toast.error("Network error - Cannot reach server. Check your connection and server status.");
            } else {
                toast.error(`Error: ${error.message}`);
            }
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

    // Handle image selection and upload to Cloudinary
    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));

            // Create local preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);

            // Auto-upload to Cloudinary
            setImageUploading(true);
            toast.info("Uploading image to Cloudinary...");

            try {
                const uploadResult = await uploadToCloudinary(file, 'eatzone/categories');

                if (uploadResult.success) {
                    console.log("Category image uploaded successfully:", uploadResult.url);
                    setCloudinaryUrl(uploadResult.url);
                    setImagePreview(uploadResult.url); // Use Cloudinary URL for preview
                    toast.success("Image uploaded successfully!");
                } else {
                    console.error("Cloudinary upload failed:", uploadResult.error);
                    toast.error(uploadResult.error || "Failed to upload image");
                }
            } catch (error) {
                console.error("Image upload error:", error);
                toast.error("Failed to upload image");
            } finally {
                setImageUploading(false);
            }
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
        setCloudinaryUrl('');
        setEditingCategory(null);
        setImageUploading(false);
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

        // Set existing image for preview
        const existingImageUrl = category.image.startsWith('http') ? category.image : `${url}/images/${category.image}`;
        setImagePreview(existingImageUrl);

        // If it's already a Cloudinary URL, set it
        if (category.image.startsWith('http')) {
            setCloudinaryUrl(category.image);
        } else {
            setCloudinaryUrl('');
        }

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

        if (!editingCategory && !cloudinaryUrl) {
            toast.error("Category image is required. Please upload an image.");
            return;
        }

        if (imageUploading) {
            toast.error("Please wait for image upload to complete");
            return;
        }

        try {
            setLoading(true);
            const submitData = new FormData();
            submitData.append('name', formData.name.trim());
            submitData.append('description', formData.description.trim());
            submitData.append('order', formData.order);
            submitData.append('isActive', formData.isActive);

            // Use Cloudinary URL if available, otherwise use existing image
            if (cloudinaryUrl) {
                submitData.append('image', cloudinaryUrl);
            } else if (editingCategory && editingCategory.image) {
                // Keep existing image if no new image uploaded
                submitData.append('image', editingCategory.image);
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
                                src={getCategoryImageUrl(category.image, url)}
                                alt={category.name}
                                onError={(e) => {
                                    console.log(`Failed to load admin image for ${category.name}:`, category.image);
                                    e.target.src = getDefaultCategoryImage(category.name);
                                }}
                                onLoad={() => {
                                    console.log(`Successfully loaded admin image for ${category.name}`);
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
                                    disabled={imageUploading}
                                />

                                {imageUploading && (
                                    <div className="upload-status">
                                        <p>🔄 Uploading image to Cloudinary...</p>
                                    </div>
                                )}

                                {imagePreview && !imageUploading && (
                                    <div className="image-preview">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            onError={(e) => {
                                                e.target.src = '/placeholder-food.jpg';
                                            }}
                                        />
                                        {cloudinaryUrl && (
                                            <div className="upload-success">
                                                <span className="success-text">✅ Image uploaded to Cloudinary!</span>
                                                <small>URL: {cloudinaryUrl}</small>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <small className="form-help">
                                    Recommended: 400x400px, JPG or PNG, max 5MB. Images will be automatically uploaded to Cloudinary.
                                </small>
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
