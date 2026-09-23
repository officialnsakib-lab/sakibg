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
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    let query: any = { role: 'vendor' };
    
    if (status === 'approved') {
      query.isApprovedVendor = true;
      query.isBanned = false;
    } else if (status === 'pending') {
      query.isApprovedVendor = false;
      query.isBanned = false;
    } else if (status === 'banned') {
      query.isBanned = true;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    let sortOption: any = { createdAt: -1 };
    switch (sort) {
      case 'sales':
        sortOption = { totalSales: -1 };
        break;
      case 'earnings':
        sortOption = { totalEarnings: -1 };
        break;
      case 'rating':
        sortOption = { averageRating: -1 };
        break;
    }
    
    const skip = (page - 1) * limit;
    
    const [vendors, total] = await Promise.all([
      (User as any).find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .select('-password'),
      (User as any).countDocuments(query)
    ]);
    
    return NextResponse.json(
      {
        success: true,
        data: {
          vendors,
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
    console.error('Vendors error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get vendors' },
      { status: 500 }
    );
  }
}