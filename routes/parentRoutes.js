import { Router } from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import {
  getParentDashboard,
  getVisitingDays,
  requestVisit,
  getParentVisits,
  getVisitDetails,
  cancelVisit,
  generateVisitQR,
  getParentNotifications,
  markNotificationRead,
  updateParentProfile,
} from '../controllers/parentController.js';
import {
  getVisitingDaysValidation,
  requestVisitValidation,
  getVisitsValidation,
  cancelVisitValidation,
  updateProfileValidation,
} from '../middlewares/validator.js';

const router = Router();

// All routes require parent authentication
router.use(protect());
router.use(authorize(['parent']));

// Dashboard
router.get('/dashboard', getParentDashboard);

// Visiting days
router.get('/schools/:schoolId/visiting-days', getVisitingDaysValidation, getVisitingDays);

// Visit management
router.post('/visits', requestVisitValidation, requestVisit);
router.get('/visits', getVisitsValidation, getParentVisits);
router.get('/visits/:visitId', getVisitDetails);
router.patch('/visits/:visitId/cancel', cancelVisitValidation, cancelVisit);
router.get('/visits/:visitId/qr', generateVisitQR);

// Notifications
router.get('/notifications', getParentNotifications);
router.patch('/notifications/:notificationId/read', markNotificationRead);

// Profile
router.patch('/profile', updateProfileValidation, updateParentProfile);

export default router;
