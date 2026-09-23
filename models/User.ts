// models/User.ts
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'vendor', 'customer'],
    default: 'customer'
  },
  vendorType: {
    type: String,
    enum: ['digital_products', 'website_demo', 'both'],
    default: null
  },
  isApprovedVendor: {
    type: Boolean,
    default: false
  },
  commissionRate: {
    type: Number,
    default: 10
  },
  
  // Earnings
  totalSales: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  pendingEarnings: {
    type: Number,
    default: 0
  },
  pendingIncome: {
    type: Number,
    default: 0
  },
  pendingWithdrawal: {
    type: Number,
    default: 0
  },
  withdrawnEarnings: {
    type: Number,
    default: 0
  },
  
  // Email Verification
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationOTP: {
    type: String,
    default: null
  },
  emailVerificationExpires: {
    type: Date,
    default: null
  },
  
  // ✅ Password Reset (ADDED)
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  
  // Contact Info
  phone: {
    type: String,
    default: null
  },
  address: {
    type: String,
    default: null
  },
  city: {
    type: String,
    default: null
  },
  country: {
    type: String,
    default: null
  },
  postalCode: {
    type: String,
    default: null
  },
  
  // Profile
  avatar: {
    type: String,
    default: null
  },
  avatarId: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    default: null
  },
  website: {
    type: String,
    default: null
  },
  
  // Stats
  totalProducts: {
    type: Number,
    default: 0
  },
  totalWebsiteDemos: {
    type: Number,
    default: 0
  },
  activeProducts: {
    type: Number,
    default: 0
  },
  activeWebsiteDemos: {
    type: Number,
    default: 0
  },
  pendingProducts: {
    type: Number,
    default: 0
  },
  pendingWebsiteDemos: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  banReason: {
    type: String,
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// ✅ Hash password before save
userSchema.pre('save', async function() {
  const user = this as any;
  
  // Only hash if password is modified
  if (!user.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function(password: string) {
  const user = this as any;
  return await bcrypt.compare(password, user.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;