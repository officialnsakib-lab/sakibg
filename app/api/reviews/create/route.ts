import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Review from '@/models/Review';
import Product from '@/models/Product';
import Order from '@/models/Order';
import User from '@/models/User';
import { getUserFromCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const decoded = await getUserFromCookie();
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Login required' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    const { productId, rating, title, comment } = body;
    
    if (!productId || !rating || !comment) {
      return NextResponse.json(
        { success: false, error: 'All fields required' },
        { status: 400 }
      );
    }
    
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be 1-5' },
        { status: 400 }
      );
    }
    
    // Check product exists
    const product = await (Product as any).findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Check if already reviewed
    const existingReview = await (Review as any).findOne({
      productId,
      userId: decoded.userId
    });
    
    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'You already reviewed this product' },
        { status: 400 }
      );
    }
    
    // Check if purchased
    const order = await (Order as any).findOne({
      productId,
      buyerId: decoded.userId,
      paymentStatus: 'paid'
    });
    
    const user = await (User as any).findById(decoded.userId);
    
    // Create review
    const review = await (Review as any).create({
      productId,
      userId: decoded.userId,
      userName: user.name,
      userAvatar: user.avatar,
      rating,
      title: title || '',
      comment,
      isVerifiedPurchase: !!order
    });
    
    // Update product rating
    const allReviews = await (Review as any).find({ productId });
    const totalRating = allReviews.reduce((sum: number, r: any) => sum + r.rating, 0);
    const avgRating = totalRating / allReviews.length;
    
    product.averageRating = Math.round(avgRating * 10) / 10;
    product.totalReviews = allReviews.length;
    
    // Update rating breakdown
    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    allReviews.forEach((r: any) => {
      breakdown[r.rating] = (breakdown[r.rating] || 0) + 1;
    });
    product.ratingBreakdown = breakdown;
    
    await product.save();
    
    return NextResponse.json(
      { success: true, message: 'Review submitted', data: { review } },
      { status: 201 }
    );
    
  } catch (error: any) {
    console.error('Review error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit review' },
      { status: 500 }
    );
  }
}