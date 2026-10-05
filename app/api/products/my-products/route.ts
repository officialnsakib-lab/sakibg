import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import User from '@/models/User';
import { getUserFromCookie } from '@/lib/auth';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    let userId: string | null = null;
    
    // ১. কুকি থেকে ইউজার পাওয়ার চেষ্টা
    const decoded: any = await getUserFromCookie();
    if (decoded && decoded.userId) {
      userId = decoded.userId;
    }
    
    // ২. যদি কুকি থেকে না পায়, তবে হেডার বা রিকোয়েস্ট থেকে ভেন্ডর খোঁজা
    if (!userId) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        // যদি টোকেন থাকে, চাইলে আপনি আপনার টোকেন ডিকোড লজিক বসাতে পারেন
        // অথবা সরাসরি ডাটাবেজ থেকে প্রথম ভেন্ডর বা রিকোয়েস্ট ইউজার ট্র্যাক করতে পারেন
      }
    }

    // যদি ইউজার আইডি পাওয়া না যায়, তবে ডিবাগিংয়ের জন্য সাময়িকভাবে সর্বশেষ ভেন্ডর বা সব প্রোডাক্ট দেখাবে 
    // অথবা অথেন্টিকেশন ফেল রিটার্ন করবে (যাতে লোডিং না থেমে থাকে, বরং এরর টাস্ট দেখায়)
    if (!userId) {
      // ফিক্স: লোডিং আটকে না রেখে একটি সুন্দর এরর মেসেজ রিটার্ন করা
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please login again.' },
        { status: 401 }
      );
    }
    
    // Get query params
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Build query safely
    let query: any = {};
    
    if (mongoose.Types.ObjectId.isValid(userId)) {
      query.vendorId = new mongoose.Types.ObjectId(userId);
    } else {
      query.vendorId = userId;
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const skip = (page - 1) * limit;
    
    // Get products and total count concurrently
    const [products, total] = await Promise.all([
      (Product as any).find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      (Product as any).countDocuments(query)
    ]);
    
    return NextResponse.json(
      {
        success: true,
        data: {
          products: products || [],
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get products' },
      { status: 500 }
    );
  }
}