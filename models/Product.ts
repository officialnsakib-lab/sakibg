// models/Product.ts
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  // Basic Info
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: String,

  // Product Type (Expanded to support Physical, Digital & Website)
  productType: {
    type: String,
    enum: ['physical', 'digital', 'website'],
    default: 'digital',
    index: true
  },

  // Categories 
  category: {
    type: String,
    required: true,
    index: true
  },
  subCategory: String,
  
  // Website specific type
  websiteType: {
    type: String,
    enum: ['static', 'dynamic', 'single-page', 'multi-page', 'full-stack'],
    default: null
  },

  // Physical Product Specific (Shipping & Weight)
  weight: {
    type: Number,
    default: 0 // কেজিতে ওজনের হিসাব (শিপিং চার্জের জন্য)
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  stock: {
    type: Number,
    default: 0 // ফিজিক্যাল প্রোডাক্ট বা স্টক ম্যানেজমেন্টের জন্য
  },

  tags: [String],

  // Pricing
  price: {
    type: Number,
    required: true
  },
  salePrice: Number,
  currency: {
    type: String,
    default: 'BDT' // বাংলাদেশ কেন্দ্রিক কাজের জন্য ডিফল্ট BDT করা যেতে পারে
  },
  discountPercent: {
    type: Number,
    default: 0
  },

  // Files (For Digital Products)
  fileUrl: {
    type: String,
    required: function() { return (this as any).productType === 'digital'; } // ডিজিটাল হলে ফাইল বাধ্যতামূলক
  },
  fileId: String,
  fileSize: String,
  fileFormat: String,
  
  // Media
  thumbnailUrl: String,
  thumbnailId: String,
  previewImages: [{
    url: String,
    id: String
  }],
  demoUrl: String,
  videoUrl: String,

  // Details
  features: [String],
  requirements: [String],
  documentation: String,
  version: {
    type: String,
    default: '1.0.0'
  },
  technologies: [String],
  pages: [String],
  includes: [String],
  supportIncluded: {
    type: Boolean,
    default: false
  },
  supportDuration: String,
  updatesIncluded: {
    type: Boolean,
    default: false
  },

  // Stats
  views: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  },
  sales: {
    type: Number,
    default: 0
  },
  revenue: {
    type: Number,
    default: 0
  },

  // Ratings (সংশোধিত অংশ)
  averageRating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  ratingBreakdown: {
    1: { type: Number, default: 0 },
    2: { type: Number, default: 0 },
    3: { type: Number, default: 0 },
    4: { type: Number, default: 0 },
    5: { type: Number, default: 0 }
  },

  // Premium & Verification
  isVerified: {
    type: Boolean,
    default: false,
    index: true
  },
  isPremium: {
    type: Boolean,
    default: false,
    index: true
  },
  isAdsenseApproved: {
    type: Boolean,
    default: false
  },
  isBestSeller: {
    type: Boolean,
    default: false,
    index: true
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  isTrending: {
    type: Boolean,
    default: false,
    index: true
  },
  isNew: {
    type: Boolean,
    default: true
  },

  // Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'archived'],
    default: 'pending',
    index: true
  },
  rejectionReason: String,
  approvedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // SEO
  metaTitle: String,
  metaDescription: String,
  keywords: [String],

  // Settings
  allowComments: {
    type: Boolean,
    default: true
  },
  lastUpdated: Date
}, {
  timestamps: true,
  suppressReservedKeysWarning: true
});

// Pre-save hook
productSchema.pre('save', function() {
  const product = this as any;
  
  if (product.isModified('title')) {
    product.slug = product.title.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-');
  }
  
  product.updatedAt = new Date();
});

// Indexes
productSchema.index({ title: 'text', description: 'text', tags: 'text' });
productSchema.index({ vendorId: 1, status: 1 });
productSchema.index({ category: 1, status: 1, productType: 1 });
productSchema.index({ price: 1 });
productSchema.index({ averageRating: -1 });
productSchema.index({ sales: -1 });
productSchema.index({ views: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ isFeatured: 1, status: 1 });
productSchema.index({ isBestSeller: 1, status: 1 });
productSchema.index({ isVerified: 1, status: 1 });
productSchema.index({ isPremium: 1, status: 1 });
productSchema.index({ productType: 1, status: 1 });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;