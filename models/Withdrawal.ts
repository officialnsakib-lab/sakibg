import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  withdrawalId: {
    type: String,
    unique: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  method: {
    type: String,
    enum: ['bkash', 'nagad', 'bank'],
    required: true
  },
  accountNumber: {
    type: String,
    required: true
  },
  accountHolderName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'rejected'],
    default: 'pending'
  },
  rejectionReason: String,
  processedAt: Date,
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  transactionId: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

withdrawalSchema.pre('save', function() {
  const withdrawal = this as any;
  if (withdrawal.isNew) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    withdrawal.withdrawalId = `WDR-${timestamp}-${random}`;
  }
});

const Withdrawal = mongoose.models.Withdrawal || mongoose.model('Withdrawal', withdrawalSchema);

export default Withdrawal;