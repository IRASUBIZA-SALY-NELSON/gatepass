import { Router } from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import {
  initializePayment,
  confirmPayment,
  getPaymentStatus,
  getPaymentHistory,
  refundPayment,
  getPaymentStats,
} from '../controllers/paymentController.js';
import {
  idParamValidation,
  initializePaymentValidation,
  confirmPaymentValidation,
  refundValidation,
} from '../middlewares/validator.js';

const router = Router();

// Public webhook for payment confirmation (no auth required)
router.post('/webhook/confirm', confirmPaymentValidation, confirmPayment);

// Protected routes
router.use(protect());

// Parent payment routes
router.post('/visits/:visitId/initialize', idParamValidation, initializePaymentValidation, initializePayment);
router.get('/visits/:visitId/status', idParamValidation, getPaymentStatus);
router.get('/history', getPaymentHistory);

// Admin payment routes
router.patch('/:paymentId/refund', authorize(['system_admin', 'school_admin']), idParamValidation, refundValidation, refundPayment);
router.get('/stats', authorize(['system_admin', 'school_admin']), getPaymentStats);

export default router;
