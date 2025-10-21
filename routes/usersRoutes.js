import { Router } from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import {
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
  bulkDeleteUsers,
} from '../controllers/userController.js';
import {
  listUsersValidation,
  idParamValidation,
  updateUserValidation,
  bulkDeleteValidation,
} from '../middlewares/validator.js';

const router = Router();

// All routes in this router are protected
router.use(protect());

// List users (admins)
router.get('/', authorize(['system_admin', 'school_admin']), listUsersValidation, listUsers);

// Get user by id (admins)
router.get('/:id', authorize(['system_admin', 'school_admin']), idParamValidation, getUserById);

// Update user (admins)
router.put('/:id', authorize(['system_admin', 'school_admin']), idParamValidation, updateUserValidation, updateUser);

// Delete user (system_admin only)
router.delete('/:id', authorize(['system_admin']), idParamValidation, deleteUser);

// Bulk delete users (system_admin only)
router.post('/bulk-delete', authorize(['system_admin']), bulkDeleteValidation, bulkDeleteUsers);

export default router;
