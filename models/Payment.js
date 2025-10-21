import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema(
  {
    visitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Visit', required: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    amount: { type: Number, required: true }, // RWF
    currency: { type: String, default: 'RWF' },
    paymentMethod: { 
      type: String, 
      enum: ['momo', 'stripe', 'flutterwave', 'cash'], 
      required: true 
    },
    externalPaymentId: { type: String, required: true }, // External payment reference
    status: { 
      type: String, 
      enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'], 
      default: 'pending' 
    },
    transactionId: { type: String, default: '' },
    phoneNumber: { type: String, default: '' }, // For MoMo payments
    paymentDetails: {
      provider: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      reference: { type: String, default: '' },
    },
    processedAt: { type: Date, default: null },
    refundedAt: { type: Date, default: null },
    refundReason: { type: String, default: '' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

PaymentSchema.index({ visitId: 1 });
PaymentSchema.index({ parentId: 1 });
PaymentSchema.index({ schoolId: 1 });
PaymentSchema.index({ externalPaymentId: 1 });
PaymentSchema.index({ status: 1 });

export const Payment = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
