import mongoose from 'mongoose';

const VisitingDaySchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    description: { type: String, default: '' },
  },
  { _id: true }
);

const SchoolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    leader: { type: String, default: '' }, // Principal/Headmaster name
    contactPerson: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    apiUrl: { type: String, default: '' },
    apiKey: { type: String, default: '' },
    studentDataMethod: { type: String, enum: ['api', 'csv'], default: 'api' },
    csvFilePath: { type: String, default: '' },
    visitingDays: { type: [VisitingDaySchema], default: [] },
    isActive: { type: Boolean, default: true },
    settings: {
      visitFee: { type: Number, default: 200 }, // RWF
      maxVisitorsPerVisit: { type: Number, default: 2 },
      allowAdvanceBooking: { type: Number, default: 30 }, // days
      requireApproval: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export const School = mongoose.models.School || mongoose.model('School', SchoolSchema);
