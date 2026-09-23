// app/api/products/my-products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import { getUserFromCookie } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Check authentication
  const decoded = await getUserFromCookie();
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Get query params
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Build query
    let query: any = { vendorId: decoded.userId };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const skip = (page - 1) * limit;
    
    // Get products
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
    console.error('Get products error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get products' },
      { status: 500 }
    );
  }
}