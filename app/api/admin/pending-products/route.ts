// app/api/admin/pending-products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import { getUserFromCookie } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Check admin
  const decoded = await getUserFromCookie();
    
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Build query
    let query: any = { status: 'pending' };
    
    if (type !== 'all') {
      query.productType = type;
    }
    
    const skip = (page - 1) * limit;
    
    const [products, total] = await Promise.all([
      (Product as any).find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('vendorId', 'name email avatar'),
      (Product as any).countDocuments(query)
    ]);
    
    return NextResponse.json(
      {
        success: true,
        data: {
          products,
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
    console.error('Pending products error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get pending products' },
      { status: 500 }
    );
  }
}