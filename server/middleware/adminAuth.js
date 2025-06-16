import jwt from 'jsonwebtoken';
import adminModel from '../models/adminModel.js';

const adminAuthMiddleware = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No admin token provided.'
            });
        }

        // Extract token from "Bearer <token>"
        const token = authHeader.substring(7);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No admin token provided.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if token is for admin
        if (decoded.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        // Get admin from database to check if account is still active
        const admin = await adminModel.findById(decoded.id);
        
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Admin account not found.'
            });
        }

        if (!admin.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Admin account has been deactivated.'
            });
        }

        // Add admin info to request
        req.body.adminId = decoded.id;
        req.adminId = decoded.id;
        req.admin = admin;

        console.log('Admin auth middleware - Admin ID:', decoded.id);
        next();
    } catch (error) {
        console.error('Admin auth middleware error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid admin token.'
        });
    }
};

// Middleware to check specific admin permissions
const checkAdminPermission = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            const admin = req.admin;
            
            if (!admin) {
                return res.status(401).json({
                    success: false,
                    message: 'Admin authentication required.'
                });
            }

            // Check if admin has the required permission
            if (!admin.permissions.includes(requiredPermission)) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. ${requiredPermission} permission required.`
                });
            }

            next();
        } catch (error) {
            console.error('Admin permission check error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error checking admin permissions.'
            });
        }
    };
};

export default adminAuthMiddleware;
export { checkAdminPermission };
