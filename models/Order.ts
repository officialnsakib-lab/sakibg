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
    enum: ['digital', 'website', 'physical'],
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
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
    default: 'BDT'
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

  // Payment Details
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentMethod: String,
  paymentId: String,       // Transaction ID
  senderNumber: String,    // পেমেন্ট প্রেরকের মোবাইল নম্বর
  paymentDate: Date,
  refundReason: String,
  refundDate: Date,

  // Order Status Flow
  // Physical: pending -> confirmed -> processing -> shipped -> delivered
  // Digital:  pending -> completed (এডমিন পেমেন্ট ভেরিফাই করে Approve করলে)
  orderStatus: {
    type: String,
    enum: [
      'pending',     // অর্ডার গ্রহণ করা হয়েছে, পেমেন্ট পেন্ডিং
      'confirmed',   // এডমিন/ভেন্ডর অর্ডার নিশ্চিত করেছে (Physical)
      'processing',  // প্যাকেজিং/প্রসেসিং চলছে (Physical)
      'shipped',     // কুরিয়ারে পাঠানো হয়েছে (Physical)
      'delivered',   // কাস্টমার রিসিভ করেছে (Physical)
      'completed',   // ডিজিটাল প্রোডাক্টের ক্ষেত্রে এপ্রুভড বা সফল সম্পন্ন
      'cancelled',   // বাতিল করা হয়েছে
      'refunded'     // টাকা ফেরত দেওয়া হয়েছে
    ],
    default: 'pending'
  },

  // Digital Product Specific Fields
  downloadToken: String,
  downloadExpiry: Date,
  downloadCount: {
    type: Number,
    default: 0
  },

  // Customer & Vendor Info
  buyerName: String,
  buyerEmail: String,
  vendorName: String,
  vendorEmail: String,
  customerNote: String,
  adminNote: String,

  // Physical Product Shipping Details
  shippingAddress: {
    fullName: String,
    phone: String,
    address: String,
    city: String,
    zone: String,
    postalCode: String
  },
  deliveryCharge: {
    type: Number,
    default: 0
  },
  courierName: String,     // যেমন: Pathao, Steadfast, RedX
  trackingNumber: String,  // কুরিয়ারের ট্র্যাকিং আইডি

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate Order ID and Download Token logic
orderSchema.pre('save', function() {
  const order = this as any;
  
  // ১. নতুন অর্ডার তৈরি হলে ইউনিক Order ID জেনারেট করা
  if (order.isNew) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    order.orderId = `ORD-${timestamp}-${random}`;
  }

  // ২. ডিজিটাল প্রোডাক্টের পেমেন্ট এপ্রুভ (completed / paid) হলে তবেই সিকিউর Download Token তৈরি হবে
  if (
    (order.productType === 'digital' || order.productType === 'website') && 
    (order.orderStatus === 'completed' || order.paymentStatus === 'paid') && 
    !order.downloadToken
  ) {
    order.downloadToken = crypto.randomBytes(32).toString('hex');
    // ডাউনলোডের টোকেন মেয়াদ ৩০ দিন
    order.downloadExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  
  order.updatedAt = new Date();
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;