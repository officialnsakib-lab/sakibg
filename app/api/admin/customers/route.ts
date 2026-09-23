import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { getUserFromCookie } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const decoded = await getUserFromCookie();
    
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    let query: any = { role: 'customer' };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const [customers, total] = await Promise.all([
      (User as any).find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('name email avatar isActive isBanned totalOrders totalSpent createdAt lastLogin'),
      (User as any).countDocuments(query)
    ]);
    
    return NextResponse.json(
      {
        success: true,
        data: {
          customers,
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
    console.error('Customers error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get customers' },
      { status: 500 }
    );
  }
}