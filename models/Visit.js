import mongoose from 'mongoose';

const VisitSchema = new mongoose.Schema(
  {
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    studentId: { type: String, required: true },
    studentName: { type: String, default: '' }, // Cached student name
    studentClass: { type: String, default: '' }, // Cached student class
    visitDate: { type: Date, required: true },
    numVisitors: { type: Number, default: 1, min: 1 },
    status: {
      type: String,
      enum: ['pending_payment', 'confirmed', 'rejected', 'checked_in', 'cancelled'],
      default: 'pending_payment',
      index: true,
    },
    reason: { type: String, default: '' },
    visitId: { type: String, required: true, unique: true, index: true },
    approvalNotes: { type: String, default: '' },
    paymentId: { type: String, default: '' }, // External payment reference
    paymentStatus: { 
      type: String, 
      enum: ['pending', 'completed', 'failed', 'refunded'], 
      default: 'pending' 
    },
    amount: { type: Number, default: 200 }, // RWF
    qrCode: { type: String, default: '' }, // QR code for gate verification
    checkInTime: { type: Date, default: null },
    checkInBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    visitorNames: { type: [String], default: [] }, // Names of visitors
    visitorPhones: { type: [String], default: [] }, // Phone numbers of visitors
  },
  { timestamps: true }
);

VisitSchema.index({ schoolId: 1, visitDate: 1 });

export const Visit = mongoose.models.Visit || mongoose.model('Visit', VisitSchema);
