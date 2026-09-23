// models/WebsiteDemo.ts
import mongoose from 'mongoose';

const websiteDemoSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  websiteName: {
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
  shortDescription: {
    type: String,
    default: null
  },
  category: {
    type: String,
    required: true,
    enum: ['ecommerce', 'blog', 'portfolio', 'business', 'education', 'restaurant', 'realestate', 'healthcare', 'travel', 'fashion', 'technology', 'entertainment', 'other']
  },
  websiteType: {
    type: String,
    enum: ['static', 'dynamic', 'single-page', 'multi-page', 'full-stack'],
    default: 'dynamic'
  },
  technologies: {
    type: [String],
    default: []
  },
  tags: {
    type: [String],
    default: []
  },
  price: {
    type: Number,
    required: true
  },
  salePrice: {
    type: Number,
    default: null
  },
  currency: {
    type: String,
    default: 'USD'
  },
  discountPercent: {
    type: Number,
    default: 0
  },
  demoUrl: {
    type: String,
    required: true
  },
  sourceCodeUrl: {
    type: String,
    default: null
  },
  thumbnailUrl: {
    type: String,
    default: null
  },
  thumbnailId: {
    type: String,
    default: null
  },
  previewImages: [{
    url: String,
    id: String
  }],
  videoDemoUrl: {
    type: String,
    default: null
  },
  features: {
    type: [String],
    default: []
  },
  pages: {
    type: [String],
    default: []
  },
  includes: {
    type: [String],
    default: []
  },
  supportIncluded: {
    type: Boolean,
    default: false
  },
  supportDuration: {
    type: String,
    default: null
  },
  updatesIncluded: {
    type: Boolean,
    default: false
  },
  views: {
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
  averageRating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'archived'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  metaTitle: {
    type: String,
    default: null
  },
  metaDescription: {
    type: String,
    default: null
  },
  keywords: {
    type: [String],
    default: []
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isTrending: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create slug - FIXED VERSION
websiteDemoSchema.pre('save', function() {
  const website = this as any;
  if (this.isModified('websiteName')) {
    this.slug = this.websiteName
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-');
  }
  website.updatedAt = new Date();
});

// Indexes
websiteDemoSchema.index({ websiteName: 'text', description: 'text', tags: 'text' });
websiteDemoSchema.index({ vendorId: 1, status: 1 });
websiteDemoSchema.index({ category: 1, status: 1 });

const WebsiteDemo = mongoose.models.WebsiteDemo || mongoose.model('WebsiteDemo', websiteDemoSchema);

export default WebsiteDemo;