import mongoose from 'mongoose';
import { User } from '../models/User.js';

export async function listUsers(req, res, next) {
  try {
    const { page = 1, limit = 20, userType } = req.query;
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const filter = {};
    if (userType) filter.userType = userType;

    const [items, total] = await Promise.all([
      User.find(filter).select('-password').skip((pageNum - 1) * limitNum).limit(limitNum).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      page: pageNum,
      limit: limitNum,
      total,
      items,
    });
  } catch (err) {
    next(err);
  }
}

export async function getUserById(req, res, next) {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { userType, name, email, phone, schoolId, linkedStudents } = req.body;

    const update = {};
    if (userType !== undefined) update.userType = userType;
    if (name !== undefined) update.name = name;
    if (email !== undefined) update.email = email.toLowerCase();
    if (phone !== undefined) update.phone = phone;
    if (schoolId !== undefined) update.schoolId = schoolId || undefined;
    if (linkedStudents !== undefined) update.linkedStudents = linkedStudents;

    const user = await User.findByIdAndUpdate(id, update, { new: true, runValidators: true, context: 'query' }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.status(200).json({ success: true, message: 'User deleted' });
  } catch (err) {
    next(err);
  }
}

export async function bulkDeleteUsers(req, res, next) {
  try {
    const { ids } = req.body;
    const objectIds = ids.map((s) => new mongoose.Types.ObjectId(s));
    const result = await User.deleteMany({ _id: { $in: objectIds } });
    return res.status(200).json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    next(err);
  }
}
