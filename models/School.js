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
    apiUrl: { type: String, default: '' },
    apiKey: { type: String, default: '' },
    studentDataMethod: { type: String, enum: ['api', 'csv'], default: 'api' },
    csvFilePath: { type: String, default: '' },
    visitingDays: { type: [VisitingDaySchema], default: [] },
  },
  { timestamps: true }
);

export const School = mongoose.models.School || mongoose.model('School', SchoolSchema);
