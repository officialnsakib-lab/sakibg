import mongoose from 'mongoose';

const WishlistSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  }
}, { timestamps: true });

// একজন ইউজার যেন একই প্রডাক্ট একাধিকবার উইশলিস্টে যুক্ত করতে না পারে
WishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

export default mongoose.models.Wishlist || mongoose.model('Wishlist', WishlistSchema);