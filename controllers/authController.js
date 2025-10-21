import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from '../models/User.js';

// Load env from config/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../config/.env') });

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1d' });
}

export async function register(req, res, next) {
  try {
    const { userType, name, email, phone, password, schoolId, linkedStudents } = req.body;

    // Check duplicates for email and phone
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ success: false, message: 'Phone already in use' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      userType,
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      schoolId: schoolId || undefined,
      linkedStudents: userType === 'parent' ? linkedStudents : undefined,
    });

    const token = signToken(user._id);
    return res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        userType: user.userType,
        name: user.name,
        email: user.email,
        phone: user.phone,
        schoolId: user.schoolId || null,
        linkedStudents: user.linkedStudents || [],
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { identifier, password } = req.body; // identifier can be email or phone

    // Determine if identifier is email or phone
    const query = identifier.includes('@')
      ? { email: identifier.toLowerCase() }
      : { phone: identifier };

    const user = await User.findOne(query).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = signToken(user._id);
    return res.status(200).json({ success: true, token });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res) {
  // req.user is populated by protect()
  return res.status(200).json({ success: true, user: req.user });
}
