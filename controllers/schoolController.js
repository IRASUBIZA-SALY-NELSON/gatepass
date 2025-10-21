import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Visit } from '../models/Visit.js';
import { School } from '../models/School.js';
import { User } from '../models/User.js';
import { notifyUser } from '../services/notificationService.js';
import { getStudentById, testSchoolApi } from '../services/schoolApiService.js';
import { generateVisitsPdf } from '../utils/generatePdf.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer setup for CSV uploads
const upload = multer({ dest: path.join(__dirname, '../uploads') });
export const csvUploadMiddleware = upload.single('file');

// Helper to ensure school scope
function requireSchool(req) {
  if (!req.user?.schoolId) {
    const err = new Error('School context missing');
    err.statusCode = 403;
    throw err;
  }
  return req.user.schoolId;
}

// Visiting Days
export async function addVisitingDay(req, res, next) {
  try {
    const schoolId = requireSchool(req);
    const { date, description = '' } = req.body;
    const when = new Date(date);
    if (when < new Date(new Date().toDateString())) return res.status(400).json({ success: false, message: 'Date cannot be in the past' });

    const school = await School.findById(schoolId);
    if (!school) return res.status(404).json({ success: false, message: 'School not found' });
    const dup = school.visitingDays.find((d) => new Date(d.date).toDateString() === when.toDateString());
    if (dup) return res.status(409).json({ success: false, message: 'Visiting day already exists' });

    school.visitingDays.push({ date: when, description });
    await school.save();
    return res.status(201).json({ success: true, visitingDays: school.visitingDays });
  } catch (err) { next(err); }
}

export async function listVisitingDays(req, res, next) {
  try {
    const schoolId = requireSchool(req);
    const school = await School.findById(schoolId).select('visitingDays');
    return res.status(200).json({ success: true, visitingDays: (school?.visitingDays || []).sort((a,b)=> new Date(a.date)-new Date(b.date)) });
  } catch (err) { next(err); }
}

export async function updateVisitingDay(req, res, next) {
  try {
    const schoolId = requireSchool(req);
    const { id } = req.params;
    const { date, description } = req.body;
    const school = await School.findById(schoolId);
    if (!school) return res.status(404).json({ success: false, message: 'School not found' });
    const day = school.visitingDays.id(id);
    if (!day) return res.status(404).json({ success: false, message: 'Visiting day not found' });

    if (date) {
      const when = new Date(date);
      if (when < new Date(new Date().toDateString())) return res.status(400).json({ success: false, message: 'Date cannot be in the past' });
      const conflict = school.visitingDays.find((d) => d._id.toString() !== id && new Date(d.date).toDateString() === when.toDateString());
      if (conflict) return res.status(409).json({ success: false, message: 'Another visiting day already exists on that date' });
      day.date = when;
    }
    if (typeof description === 'string') day.description = description;

    await school.save();
    return res.status(200).json({ success: true, visitingDays: school.visitingDays });
  } catch (err) { next(err); }
}

export async function deleteVisitingDay(req, res, next) {
  try {
    const schoolId = requireSchool(req);
    const { id } = req.params;
    const school = await School.findById(schoolId);
    if (!school) return res.status(404).json({ success: false, message: 'School not found' });
    const day = school.visitingDays.id(id);
    if (!day) return res.status(404).json({ success: false, message: 'Visiting day not found' });

    // Prevent deletion if visits are booked that day
    const start = new Date(new Date(day.date).toDateString());
    const end = new Date(start); end.setDate(end.getDate()+1);
    const count = await Visit.countDocuments({ schoolId, visitDate: { $gte: start, $lt: end }, status: { $in: ['confirmed','checked_in'] } });
    if (count > 0) return res.status(409).json({ success: false, message: 'Cannot delete: visits booked on this day' });

    day.deleteOne();
    await school.save();
    return res.status(200).json({ success: true, visitingDays: school.visitingDays });
  } catch (err) { next(err); }
}

// Visits listing and filtering
export async function listVisits(req, res, next) {
  try {
    const schoolId = requireSchool(req);
    const { page = 1, limit = 20, status, studentId, from, to } = req.query;
    const filter = { schoolId };
    if (status) filter.status = status;
    if (studentId) filter.studentId = studentId;
    if (from || to) {
      filter.visitDate = {};
      if (from) filter.visitDate.$gte = new Date(from);
      if (to) filter.visitDate.$lte = new Date(to);
    }

    const [items, total] = await Promise.all([
      Visit.find(filter).sort({ visitDate: -1 }).skip((page - 1) * limit).limit(parseInt(limit, 10)),
      Visit.countDocuments(filter),
    ]);

    return res.status(200).json({ success: true, page: Number(page), limit: Number(limit), total, items });
  } catch (err) { next(err); }
}

export async function listPendingVisits(req, res, next) {
  try {
    req.query.status = 'pending_payment';
    return listVisits(req, res, next);
  } catch (err) { next(err); }
}

export async function approveVisit(req, res, next) {
  try {
    const schoolId = requireSchool(req);
    const { visitId } = req.params;
    const { notes = '' } = req.body;

    const visit = await Visit.findOne({ schoolId, visitId });
    if (!visit) return res.status(404).json({ success: false, message: 'Visit not found' });
    if (!['pending_payment','rejected'].includes(visit.status)) return res.status(409).json({ success: false, message: 'Visit cannot be approved from current status' });

    visit.status = 'confirmed';
    visit.approvalNotes = notes;
    await visit.save();
    await notifyUser(visit.parentId, { type: 'visit_approved', visitId: visit.visitId });
    return res.status(200).json({ success: true, visit });
  } catch (err) { next(err); }
}

export async function rejectVisit(req, res, next) {
  try {
    const schoolId = requireSchool(req);
    const { visitId } = req.params;
    const { reason } = req.body;

    const visit = await Visit.findOne({ schoolId, visitId });
    if (!visit) return res.status(404).json({ success: false, message: 'Visit not found' });
    if (!['pending_payment','confirmed'].includes(visit.status)) return res.status(409).json({ success: false, message: 'Visit cannot be rejected from current status' });

    visit.status = 'rejected';
    visit.reason = reason;
    await visit.save();
    await notifyUser(visit.parentId, { type: 'visit_rejected', visitId: visit.visitId, reason });
    return res.status(200).json({ success: true, visit });
  } catch (err) { next(err); }
}

export async function visitStats(req, res, next) {
  try {
    const schoolId = requireSchool(req);
    const start = new Date(new Date().toDateString());
    const end = new Date(start); end.setDate(end.getDate()+1);

    const [today, totals] = await Promise.all([
      Visit.aggregate([
        { $match: { schoolId: new mongoose.Types.ObjectId(schoolId), visitDate: { $gte: start, $lt: end } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Visit.aggregate([
        { $match: { schoolId: new mongoose.Types.ObjectId(schoolId) } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    return res.status(200).json({ success: true, today, totals });
  } catch (err) { next(err); }
}

// Reports
export async function visitsReportJson(req, res, next) {
  try {
    // Re-use listVisits filter logic
    return listVisits(req, res, next);
  } catch (err) { next(err); }
}

export async function visitsReportPdf(req, res, next) {
  try {
    const schoolId = requireSchool(req);
    const { status, studentId, from, to } = req.query;
    const filter = { schoolId };
    if (status) filter.status = status;
    if (studentId) filter.studentId = studentId;
    if (from || to) {
      filter.visitDate = {};
      if (from) filter.visitDate.$gte = new Date(from);
      if (to) filter.visitDate.$lte = new Date(to);
    }
    const visits = await Visit.find(filter).limit(1000);
    const doc = generateVisitsPdf({ title: 'Visits Report', visits });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="visits_report.pdf"');
    doc.pipe(res);
  } catch (err) { next(err); }
}

// Settings
export async function updateSettings(req, res, next) {
  try {
    const schoolId = requireSchool(req);
    const updates = {};
    const { name, apiUrl, apiKey, studentDataMethod } = req.body;
    if (name !== undefined) updates.name = name;
    if (apiUrl !== undefined) updates.apiUrl = apiUrl;
    if (apiKey !== undefined) updates.apiKey = apiKey; // consider encrypting at rest in future
    if (studentDataMethod !== undefined) updates.studentDataMethod = studentDataMethod;

    const school = await School.findByIdAndUpdate(schoolId, updates, { new: true, runValidators: true });
    return res.status(200).json({ success: true, school });
  } catch (err) { next(err); }
}

export async function uploadStudentCsv(req, res, next) {
  try {
    const schoolId = requireSchool(req);
    if (!req.file) return res.status(400).json({ success: false, message: 'CSV file is required (field name: file)' });

    const school = await School.findById(schoolId);
    if (!school) return res.status(404).json({ success: false, message: 'School not found' });

    school.csvFilePath = req.file.path;
    school.studentDataMethod = 'csv';
    await school.save();

    // Optionally parse to validate structure
    let count = 0;
    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', () => { count += 1; })
        .on('end', resolve)
        .on('error', reject);
    });

    return res.status(200).json({ success: true, file: path.basename(req.file.path), rowsDetected: count });
  } catch (err) { next(err); }
}

export async function testApiLink(req, res, next) {
  try {
    const schoolId = requireSchool(req);
    const school = await School.findById(schoolId);
    if (!school) return res.status(404).json({ success: false, message: 'School not found' });
    const result = await testSchoolApi(school.apiUrl, school.apiKey);
    return res.status(result.ok ? 200 : 502).json({ success: result.ok, result });
  } catch (err) { next(err); }
}

// School users (security staff)
export async function addSecurityUser(req, res, next) {
  try {
    const schoolId = requireSchool(req);
    const { name, email, phone, password } = req.body;
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ success: false, message: 'Email already in use' });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email: email.toLowerCase(), phone, password: hash, userType: 'security', schoolId });
    return res.status(201).json({ success: true, user: { ...user.toObject(), password: undefined } });
  } catch (err) { next(err); }
}

export async function listSchoolUsers(req, res, next) {
  try {
    const schoolId = requireSchool(req);
    const { userType } = req.query;
    const filter = { schoolId };
    if (userType) filter.userType = userType;
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    return res.status(200).json({ success: true, users });
  } catch (err) { next(err); }
}

export async function editSchoolUser(req, res, next) {
  try {
    const schoolId = requireSchool(req);
    const { userId } = req.params;
    const { name, email, phone } = req.body;
    const user = await User.findOneAndUpdate({ _id: userId, schoolId, userType: { $ne: 'system_admin' } }, { name, email, phone }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.status(200).json({ success: true, user: { ...user.toObject(), password: undefined } });
  } catch (err) { next(err); }
}

export async function deleteSchoolUser(req, res, next) {
  try {
    const schoolId = requireSchool(req);
    const { userId } = req.params;
    const user = await User.findOneAndDelete({ _id: userId, schoolId, userType: { $ne: 'system_admin' } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.status(200).json({ success: true, message: 'User deleted' });
  } catch (err) { next(err); }
}

// Profile and auth-related
export async function getProfile(req, res, next) {
  try {
    const schoolId = requireSchool(req);
    const admin = await User.findById(req.user._id).select('-password');
    const school = await School.findById(schoolId);
    return res.status(200).json({ success: true, admin, school });
  } catch (err) { next(err); }
}

export async function updateProfile(req, res, next) {
  try {
    const { name, email, phone } = req.body;
    const admin = await User.findByIdAndUpdate(req.user._id, { name, email, phone }, { new: true });
    return res.status(200).json({ success: true, admin: { ...admin.toObject(), password: undefined } });
  } catch (err) { next(err); }
}

export async function changePassword(req, res, next) {
  try {
    const { oldPassword, newPassword } = req.body;
    const admin = await User.findById(req.user._id).select('+password');
    if (!admin) return res.status(404).json({ success: false, message: 'User not found' });
    const ok = await bcrypt.compare(oldPassword, admin.password);
    if (!ok) return res.status(400).json({ success: false, message: 'Old password is incorrect' });

    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);
    await admin.save();
    return res.status(200).json({ success: true, message: 'Password updated' });
  } catch (err) { next(err); }
}

export async function listNotifications(req, res, next) {
  try {
    // Placeholder: derive basic alerts based on pending visits
    const schoolId = requireSchool(req);
    const pending = await Visit.countDocuments({ schoolId, status: 'pending_payment' });
    const upcoming = await Visit.countDocuments({ schoolId, visitDate: { $gte: new Date() } });
    return res.status(200).json({ success: true, notifications: [
      { type: 'pending_visits', count: pending },
      { type: 'upcoming_visits', count: upcoming },
    ]});
  } catch (err) { next(err); }
}
