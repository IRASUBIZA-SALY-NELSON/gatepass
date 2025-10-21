import mongoose from 'mongoose';
import { Visit } from '../models/Visit.js';
import { Payment } from '../models/Payment.js';
import { School } from '../models/School.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { notifyUser } from '../services/notificationService.js';

// Helper to ensure parent scope
function requireParent(req) {
  if (req.user.userType !== 'parent') {
    const err = new Error('Parent access required');
    err.statusCode = 403;
    throw err;
  }
  return req.user._id;
}

// Initialize payment for a visit
export async function initializePayment(req, res, next) {
  try {
    const parentId = requireParent(req);
    const { visitId } = req.params;
    const { paymentMethod, phoneNumber } = req.body;

    const visit = await Visit.findOne({ visitId, parentId });
    if (!visit) {
      return res.status(404).json({ success: false, message: 'Visit not found' });
    }

    if (visit.status !== 'pending_payment') {
      return res.status(400).json({ success: false, message: 'Visit is not in pending payment status' });
    }

    // Get school settings
    const school = await School.findById(visit.schoolId);
    const amount = school?.settings?.visitFee || 200;

    // Generate external payment ID
    const externalPaymentId = `GP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create payment record
    const payment = await Payment.create({
      visitId: visit._id,
      parentId,
      schoolId: visit.schoolId,
      amount,
      currency: 'RWF',
      paymentMethod,
      externalPaymentId,
      phoneNumber,
      status: 'pending'
    });

    // Update visit with payment info
    visit.paymentId = externalPaymentId;
    visit.paymentStatus = 'pending';
    await visit.save();

    // TODO: Integrate with actual payment provider (MoMo, Stripe, etc.)
    // For now, simulate payment processing
    const paymentData = {
      paymentId: payment._id,
      externalPaymentId,
      amount,
      currency: 'RWF',
      paymentMethod,
      phoneNumber,
      // Mock payment URL - replace with actual provider integration
      paymentUrl: `https://payment.example.com/pay/${externalPaymentId}`,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    };

    return res.status(200).json({
      success: true,
      message: 'Payment initialized successfully',
      payment: paymentData
    });
  } catch (err) {
    next(err);
  }
}

// Confirm payment (webhook from payment provider)
export async function confirmPayment(req, res, next) {
  try {
    const { externalPaymentId, status, transactionId, amount } = req.body;

    const payment = await Payment.findOne({ externalPaymentId });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    // Update payment status
    payment.status = status;
    payment.transactionId = transactionId;
    payment.processedAt = new Date();
    await payment.save();

    // Update visit status
    const visit = await Visit.findById(payment.visitId);
    if (visit) {
      visit.paymentStatus = status;
      if (status === 'completed') {
        visit.status = 'confirmed';
        // Generate QR code for gate verification
        const qrData = {
          visitId: visit.visitId,
          parentId: visit.parentId,
          schoolId: visit.schoolId,
          studentId: visit.studentId,
          visitDate: visit.visitDate,
          numVisitors: visit.numVisitors
        };
        // TODO: Generate actual QR code
        visit.qrCode = JSON.stringify(qrData);
      }
      await visit.save();

      // Notify parent
      await notifyUser(visit.parentId, {
        type: status === 'completed' ? 'payment_success' : 'payment_failed',
        visitId: visit.visitId,
        amount: payment.amount
      });

      // Notify school
      if (status === 'completed') {
        await notifyUser(visit.schoolId, {
          type: 'visit_confirmed',
          visitId: visit.visitId
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Payment status updated',
      payment
    });
  } catch (err) {
    next(err);
  }
}

// Get payment status
export async function getPaymentStatus(req, res, next) {
  try {
    const parentId = requireParent(req);
    const { visitId } = req.params;

    const visit = await Visit.findOne({ visitId, parentId });
    if (!visit) {
      return res.status(404).json({ success: false, message: 'Visit not found' });
    }

    const payment = await Payment.findOne({ visitId: visit._id });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    return res.status(200).json({
      success: true,
      payment,
      visit
    });
  } catch (err) {
    next(err);
  }
}

// Get payment history for parent
export async function getPaymentHistory(req, res, next) {
  try {
    const parentId = requireParent(req);
    const { page = 1, limit = 10, status } = req.query;

    const filter = { parentId };
    if (status) filter.status = status;

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate('visitId', 'visitId visitDate studentName status')
        .populate('schoolId', 'name')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit)),
      Payment.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      payments
    });
  } catch (err) {
    next(err);
  }
}

// Refund payment (admin only)
export async function refundPayment(req, res, next) {
  try {
    const { paymentId } = req.params;
    const { reason = '' } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Only completed payments can be refunded' });
    }

    // Update payment status
    payment.status = 'refunded';
    payment.refundedAt = new Date();
    payment.refundReason = reason;
    await payment.save();

    // Update visit status
    const visit = await Visit.findById(payment.visitId);
    if (visit) {
      visit.status = 'cancelled';
      visit.paymentStatus = 'refunded';
      await visit.save();

      // Notify parent
      await notifyUser(visit.parentId, {
        type: 'payment_refunded',
        visitId: visit.visitId,
        amount: payment.amount,
        reason
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Payment refunded successfully',
      payment
    });
  } catch (err) {
    next(err);
  }
}

// Get payment statistics for school
export async function getPaymentStats(req, res, next) {
  try {
    const schoolId = req.user.schoolId;
    if (!schoolId) {
      return res.status(403).json({ success: false, message: 'School access required' });
    }

    const { from, to } = req.query;
    const filter = { schoolId };
    
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const stats = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const totalStats = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          completedAmount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0]
            }
          }
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      stats,
      totals: totalStats[0] || { totalPayments: 0, totalAmount: 0, completedAmount: 0 }
    });
  } catch (err) {
    next(err);
  }
}
