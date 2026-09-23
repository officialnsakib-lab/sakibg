// models/Order.ts
import mongoose from 'mongoose';
import crypto from 'crypto';

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productType: {
    type: String,
    enum: ['digital', 'website'],
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  productTitle: String,
  productSlug: String,
  price: {
    type: Number,
    required: true
  },
  originalPrice: Number,
  discountAmount: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  commissionRate: {
    type: Number,
    required: true
  },
  commissionAmount: {
    type: Number,
    required: true
  },
  vendorAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentMethod: String,
  paymentId: String,
  senderNumber: String, // ✅ Add
  paymentDate: Date,
  refundReason: String,
  refundDate: Date,
  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  downloadToken: String,
  downloadExpiry: Date,
  downloadCount: {
    type: Number,
    default: 0
  },
  buyerName: String,
  buyerEmail: String,
  vendorName: String,
  vendorEmail: String,
  customerNote: String,
  adminNote: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate order ID and token
orderSchema.pre('save', function() {
  const order = this as any;
  
  if (order.isNew) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    order.orderId = `ORD-${timestamp}-${random}`;
    order.downloadToken = crypto.randomBytes(32).toString('hex');
    order.downloadExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  
  order.updatedAt = new Date();
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;