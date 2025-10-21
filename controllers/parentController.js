import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { School } from '../models/School.js';
import { Visit } from '../models/Visit.js';
import { Payment } from '../models/Payment.js';
import { Notification } from '../models/Notification.js';
import { getStudentById } from '../services/schoolApiService.js';
import { notifyUser } from '../services/notificationService.js';
import QRCode from 'qrcode';

// Helper to ensure parent scope
function requireParent(req) {
  if (req.user.userType !== 'parent') {
    const err = new Error('Parent access required');
    err.statusCode = 403;
    throw err;
  }
  return req.user._id;
}

// Get parent dashboard with linked students
export async function getParentDashboard(req, res, next) {
  try {
    const parentId = requireParent(req);
    const parent = await User.findById(parentId).select('-password');
    
    if (!parent) {
      return res.status(404).json({ success: false, message: 'Parent not found' });
    }

    // Get school info if parent has schoolId
    let school = null;
    if (parent.schoolId) {
      school = await School.findById(parent.schoolId).select('name address phone email');
    }

    // Get upcoming visits
    const upcomingVisits = await Visit.find({
      parentId,
      visitDate: { $gte: new Date() },
      status: { $in: ['confirmed', 'checked_in'] }
    })
    .populate('schoolId', 'name')
    .sort({ visitDate: 1 })
    .limit(5);

    // Get recent visits
    const recentVisits = await Visit.find({
      parentId,
      visitDate: { $lt: new Date() }
    })
    .populate('schoolId', 'name')
    .sort({ visitDate: -1 })
    .limit(5);

    return res.status(200).json({
      success: true,
      parent,
      school,
      linkedStudents: parent.linkedStudents || [],
      upcomingVisits,
      recentVisits
    });
  } catch (err) {
    next(err);
  }
}

// Get available visiting days for a school
export async function getVisitingDays(req, res, next) {
  try {
    const parentId = requireParent(req);
    const { schoolId } = req.params;
    
    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }

    const today = new Date();
    const futureDays = school.visitingDays
      .filter(day => new Date(day.date) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return res.status(200).json({
      success: true,
      visitingDays: futureDays
    });
  } catch (err) {
    next(err);
  }
}

// Request a visit
export async function requestVisit(req, res, next) {
  try {
    const parentId = requireParent(req);
    const { schoolId, studentId, visitDate, numVisitors = 1, reason = '', visitorNames = [], visitorPhones = [] } = req.body;

    // Validate school exists
    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }

    // Validate visiting day
    const visitDateObj = new Date(visitDate);
    const visitingDay = school.visitingDays.find(day => 
      new Date(day.date).toDateString() === visitDateObj.toDateString()
    );
    
    if (!visitingDay) {
      return res.status(400).json({ success: false, message: 'Selected date is not a visiting day' });
    }

    // Validate student exists (if API is configured)
    let studentInfo = null;
    if (school.studentDataMethod === 'api' && school.apiUrl) {
      try {
        studentInfo = await getStudentById(school.apiUrl, school.apiKey, studentId);
        if (!studentInfo) {
          return res.status(400).json({ success: false, message: 'Student not found in school system' });
        }
      } catch (err) {
        return res.status(400).json({ success: false, message: 'Unable to verify student information' });
      }
    }

    // Generate unique visit ID
    const visitId = `${school.name.substring(0, 3).toUpperCase()}-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

    // Create visit record
    const visit = await Visit.create({
      parentId,
      schoolId,
      studentId,
      studentName: studentInfo?.name || '',
      studentClass: studentInfo?.class || '',
      visitDate: visitDateObj,
      numVisitors,
      reason,
      visitId,
      amount: school.settings?.visitFee || 200,
      visitorNames,
      visitorPhones,
      status: 'pending_payment'
    });

    return res.status(201).json({
      success: true,
      message: 'Visit request created successfully',
      visit
    });
  } catch (err) {
    next(err);
  }
}

// Get parent's visits
export async function getParentVisits(req, res, next) {
  try {
    const parentId = requireParent(req);
    const { page = 1, limit = 10, status, from, to } = req.query;
    
    const filter = { parentId };
    if (status) filter.status = status;
    if (from || to) {
      filter.visitDate = {};
      if (from) filter.visitDate.$gte = new Date(from);
      if (to) filter.visitDate.$lte = new Date(to);
    }

    const [visits, total] = await Promise.all([
      Visit.find(filter)
        .populate('schoolId', 'name address')
        .sort({ visitDate: -1 })
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

// Get visit details
export async function getVisitDetails(req, res, next) {
  try {
    const parentId = requireParent(req);
    const { visitId } = req.params;

    const visit = await Visit.findOne({ visitId, parentId })
      .populate('schoolId', 'name address phone email')
      .populate('parentId', 'name email phone');

    if (!visit) {
      return res.status(404).json({ success: false, message: 'Visit not found' });
    }

    // Get payment info if exists
    const payment = await Payment.findOne({ visitId: visit._id });

    return res.status(200).json({
      success: true,
      visit,
      payment
    });
  } catch (err) {
    next(err);
  }
}

// Cancel a visit
export async function cancelVisit(req, res, next) {
  try {
    const parentId = requireParent(req);
    const { visitId } = req.params;
    const { reason = '' } = req.body;

    const visit = await Visit.findOne({ visitId, parentId });
    if (!visit) {
      return res.status(404).json({ success: false, message: 'Visit not found' });
    }

    if (!['pending_payment', 'confirmed'].includes(visit.status)) {
      return res.status(400).json({ success: false, message: 'Visit cannot be cancelled' });
    }

    visit.status = 'cancelled';
    visit.reason = reason;
    await visit.save();

    // Notify school
    await notifyUser(visit.schoolId, {
      type: 'visit_cancelled',
      visitId: visit.visitId,
      reason
    });

    return res.status(200).json({
      success: true,
      message: 'Visit cancelled successfully',
      visit
    });
  } catch (err) {
    next(err);
  }
}

// Generate QR code for visit
export async function generateVisitQR(req, res, next) {
  try {
    const parentId = requireParent(req);
    const { visitId } = req.params;

    const visit = await Visit.findOne({ visitId, parentId });
    if (!visit) {
      return res.status(404).json({ success: false, message: 'Visit not found' });
    }

    if (visit.status !== 'confirmed') {
      return res.status(400).json({ success: false, message: 'Visit must be confirmed to generate QR code' });
    }

    // Generate QR code if not exists
    if (!visit.qrCode) {
      const qrData = {
        visitId: visit.visitId,
        parentId: visit.parentId,
        schoolId: visit.schoolId,
        studentId: visit.studentId,
        visitDate: visit.visitDate,
        numVisitors: visit.numVisitors
      };
      
      visit.qrCode = await QRCode.toDataURL(JSON.stringify(qrData));
      await visit.save();
    }

    return res.status(200).json({
      success: true,
      qrCode: visit.qrCode,
      visit
    });
  } catch (err) {
    next(err);
  }
}

// Get parent notifications
export async function getParentNotifications(req, res, next) {
  try {
    const parentId = requireParent(req);
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const filter = { userId: parentId };
    if (unreadOnly === 'true') filter.isRead = false;

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit)),
      Notification.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      notifications
    });
  } catch (err) {
    next(err);
  }
}

// Mark notification as read
export async function markNotificationRead(req, res, next) {
  try {
    const parentId = requireParent(req);
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: parentId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    return res.status(200).json({
      success: true,
      notification
    });
  } catch (err) {
    next(err);
  }
}

// Update parent profile
export async function updateParentProfile(req, res, next) {
  try {
    const parentId = requireParent(req);
    const { name, phone, address, preferences } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (preferences !== undefined) updateData.preferences = preferences;

    const parent = await User.findByIdAndUpdate(
      parentId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      parent
    });
  } catch (err) {
    next(err);
  }
}
