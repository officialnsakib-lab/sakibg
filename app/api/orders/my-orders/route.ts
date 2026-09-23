// app/api/orders/my-orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import { getUserFromCookie } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const decoded = await getUserFromCookie();
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Login required' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const skip = (page - 1) * limit;
    
    const [orders, total] = await Promise.all([
      (Order as any).find({ buyerId: decoded.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      (Order as any).countDocuments({ buyerId: decoded.userId })
    ]);
    
    return NextResponse.json(
      {
        success: true,
        data: {
          orders,
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
    console.error('My orders error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get orders' },
      { status: 500 }
    );
  }
}