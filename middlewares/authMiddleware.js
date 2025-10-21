import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from '../models/User.js';

// Load env from config/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../config/.env') });

export function protect() {
    return async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization || '';
            const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
            if (!token) {
                return res.status(401).json({ success: false, message: 'Not authorized: token missing' });
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // Attach minimal user info
            const user = await User.findById(decoded.id).select('-password');
            if (!user) {
                return res.status(401).json({ success: false, message: 'Not authorized: user not found' });
            }
            req.user = user;
            next();
        } catch (err) {
            const msg = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
            return res.status(401).json({ success: false, message: msg });
        }
    };
}

export function authorize(allowedRoles = []) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.userType)) {
            return res.status(403).json({ success: false, message: 'Forbidden: insufficient role' });
        }
        next();
    };
}
