import logo from './logo.png'
import add_icon from './add_icon.png'
import order_icon from './order_icon.png'
import profile_image from './profile_image.png'
import upload_area from './upload_area.png'
import parcel_icon from './parcel_icon.png'
import profile_img from './profile_img.png'

export const assets ={
    logo,
    add_icon,
    order_icon,
    profile_image,
    upload_area,
    profile_img,
    parcel_icon
}

// Use environment variable for API URL with fallback
export const url = import.meta.env.VITE_API_BASE_URL || 'https://eatzone.onrender.com'