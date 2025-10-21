import { Router } from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import {
  addVisitingDay,
  listVisitingDays,
  updateVisitingDay,
  deleteVisitingDay,
  listVisits,
  listPendingVisits,
  approveVisit,
  rejectVisit,
  visitStats,
  visitsReportJson,
  visitsReportPdf,
  updateSettings,
  uploadStudentCsv,
  testApiLink,
  addSecurityUser,
  listSchoolUsers,
  editSchoolUser,
  deleteSchoolUser,
  getProfile,
  updateProfile,
  changePassword,
  listNotifications,
  csvUploadMiddleware,
} from '../controllers/schoolController.js';
import {
  visitingDayCreate,
  visitingDayUpdate,
  idParam,
  visitsListQuery,
  approveVisitValidation,
  rejectVisitValidation,
  settingsUpdateValidation,
  addSecurityUserValidation,
  editSchoolUserValidation,
  changePasswordValidation,
} from '../middlewares/schoolValidation.js';

const router = Router();
router.use(protect());
router.use(authorize(['school_admin']));

// Visiting days
router.post('/visiting-days', visitingDayCreate, addVisitingDay);
router.get('/visiting-days', listVisitingDays);
router.patch('/visiting-days/:id', visitingDayUpdate, updateVisitingDay);
router.delete('/visiting-days/:id', idParam, deleteVisitingDay);

// Visits
router.get('/visits', visitsListQuery, listVisits);
router.get('/visits/pending', visitsListQuery, listPendingVisits);
router.patch('/visits/:visitId/approve', approveVisitValidation, approveVisit);
router.patch('/visits/:visitId/reject', rejectVisitValidation, rejectVisit);
router.get('/visits/stats', visitStats);

// Reports
router.get('/reports/visits', visitsListQuery, visitsReportJson);
router.get('/reports/visits/pdf', visitsListQuery, visitsReportPdf);

// Settings
router.patch('/settings', settingsUpdateValidation, updateSettings);
router.post('/student-data/upload', csvUploadMiddleware, uploadStudentCsv);
router.post('/api/test', testApiLink);

// Users (school scope)
router.post('/users/security', addSecurityUserValidation, addSecurityUser);
router.get('/users', listSchoolUsers);
router.patch('/users/:userId', editSchoolUserValidation, editSchoolUser);
router.delete('/users/:userId', idParam, deleteSchoolUser);

// Profile & notifications
router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.patch('/password', changePasswordValidation, changePassword);
router.get('/notifications', listNotifications);

export default router;
