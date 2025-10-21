import mongoose from 'mongoose';
import { Visit } from '../models/Visit.js';
import { User } from '../models/User.js';
import { School } from '../models/School.js';
import { Payment } from '../models/Payment.js';
import { Notification } from '../models/Notification.js';
import { notifyUser } from '../services/notificationService.js';

// Helper to ensure security user scope
function requireSecurity(req) {
  if (req.user.userType !== 'security') {
    const err = new Error('Security access required');
    err.statusCode = 403;
    throw err;
  }
  return req.user.schoolId;
}

// Verify visit by Visit ID
export async function verifyVisitById(req, res, next) {
  try {
    const schoolId = requireSecurity(req);
    const { visitId } = req.params;

    const visit = await Visit.findOne({ visitId, schoolId })
      .populate('parentId', 'name email phone')
      .populate('schoolId', 'name address');

    if (!visit) {
      return res.status(404).json({ 
        success: false, 
        message: 'Visit not found or not authorized for this school' 
      });
    }

    // Get payment info
    const payment = await Payment.findOne({ visitId: visit._id });

    return res.status(200).json({
      success: true,
      visit,
      payment,
      isValid: visit.status === 'confirmed' && visit.visitDate >= new Date()
    });
  } catch (err) {
    next(err);
  }
}

// Check in visitor
export async function checkInVisitor(req, res, next) {
  try {
    const schoolId = requireSecurity(req);
    const { visitId } = req.params;
    const { notes = '' } = req.body;

    const visit = await Visit.findOne({ visitId, schoolId });
    if (!visit) {
      return res.status(404).json({ 
        success: false, 
        message: 'Visit not found' 
      });
    }

    if (visit.status !== 'confirmed') {
      return res.status(400).json({ 
        success: false, 
        message: 'Only confirmed visits can be checked in' 
      });
    }

    if (visit.checkInTime) {
      return res.status(400).json({ 
        success: false, 
        message: 'Visitor already checked in' 
      });
    }

    // Update visit status
    visit.status = 'checked_in';
    visit.checkInTime = new Date();
    visit.checkInBy = req.user._id;
    visit.approvalNotes = notes;
    await visit.save();

    // Notify parent
    await notifyUser(visit.parentId, {
      type: 'visit_checked_in',
      visitId: visit.visitId,
      checkInTime: visit.checkInTime
    });

    return res.status(200).json({
      success: true,
      message: 'Visitor checked in successfully',
      visit
    });
  } catch (err) {
    next(err);
  }
}

// Get today's visits for gate
export async function getTodaysVisits(req, res, next) {
  try {
    const schoolId = requireSecurity(req);
    const { status, page = 1, limit = 20 } = req.query;

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const filter = {
      schoolId,
      visitDate: { $gte: startOfDay, $lt: endOfDay }
    };
    
    if (status) filter.status = status;

    const [visits, total] = await Promise.all([
      Visit.find(filter)
        .populate('parentId', 'name phone')
        .sort({ visitDate: 1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit)),
      Visit.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      visits
    });
  } catch (err) {
    next(err);
  }
}

// Get visit statistics for today
export async function getTodaysStats(req, res, next) {
  try {
    const schoolId = requireSecurity(req);

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const stats = await Visit.aggregate([
      {
        $match: {
          schoolId: new mongoose.Types.ObjectId(schoolId),
          visitDate: { $gte: startOfDay, $lt: endOfDay }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalVisitors: { $sum: '$numVisitors' }
        }
      }
    ]);

    const result = {
      total: 0,
      confirmed: 0,
      checked_in: 0,
      pending: 0,
      totalVisitors: 0
    };

    stats.forEach(stat => {
      result[stat._id] = stat.count;
      result.total += stat.count;
      result.totalVisitors += stat.totalVisitors;
    });

    return res.status(200).json({
      success: true,
      stats: result
    });
  } catch (err) {
    next(err);
  }
}

// Search visitors by name or phone
export async function searchVisitors(req, res, next) {
  try {
    const schoolId = requireSecurity(req);
    const { q, date } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'Search query must be at least 2 characters' 
      });
    }

    const searchDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const visits = await Visit.find({
      schoolId,
      visitDate: { $gte: startOfDay, $lt: endOfDay },
      $or: [
        { studentName: { $regex: q, $options: 'i' } },
        { visitorNames: { $regex: q, $options: 'i' } },
        { visitorPhones: { $regex: q, $options: 'i' } }
      ]
    })
    .populate('parentId', 'name phone')
    .sort({ visitDate: 1 });

    return res.status(200).json({
      success: true,
      visits
    });
  } catch (err) {
    next(err);
  }
}

// Get security dashboard
export async function getSecurityDashboard(req, res, next) {
  try {
    const schoolId = requireSecurity(req);

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    // Get today's stats
    const [stats, upcomingVisits, recentCheckIns] = await Promise.all([
      getTodaysStats(req, res, next).then(result => result.json?.() || result),
      Visit.find({
        schoolId,
        visitDate: { $gte: startOfDay, $lt: endOfDay },
        status: 'confirmed'
      })
      .populate('parentId', 'name phone')
      .sort({ visitDate: 1 })
      .limit(10),
      Visit.find({
        schoolId,
        visitDate: { $gte: startOfDay, $lt: endOfDay },
        status: 'checked_in'
      })
      .populate('parentId', 'name phone')
      .sort({ checkInTime: -1 })
      .limit(10)
    ]);

    return res.status(200).json({
      success: true,
      stats: stats.stats,
      upcomingVisits,
      recentCheckIns
    });
  } catch (err) {
    next(err);
  }
}
