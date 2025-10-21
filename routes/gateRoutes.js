import { Router } from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import {
  verifyVisitById,
  checkInVisitor,
  getTodaysVisits,
  getTodaysStats,
  searchVisitors,
  getSecurityDashboard,
} from '../controllers/gateController.js';
import {
  idParamValidation,
  checkInValidation,
  searchValidation,
} from '../middlewares/validator.js';

const router = Router();

// All routes require security authentication
router.use(protect());
router.use(authorize(['security']));

// Dashboard
router.get('/dashboard', getSecurityDashboard);

// Visit verification
router.get('/visits/:visitId/verify', idParamValidation, verifyVisitById);
router.patch('/visits/:visitId/checkin', idParamValidation, checkInValidation, checkInVisitor);

// Today's visits
router.get('/visits/today', getTodaysVisits);
router.get('/stats/today', getTodaysStats);

// Search
router.get('/search', searchValidation, searchVisitors);

export default router;
