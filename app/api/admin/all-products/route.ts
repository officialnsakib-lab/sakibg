import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
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
    const type = searchParams.get('type') || 'all';
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    
    let query: any = {};
    
    if (type !== 'all') {
      query.productType = type;
    }
    
    if (status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    let sortOption: any = { createdAt: -1 };
    switch (sort) {
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'price_high':
        sortOption = { price: -1 };
        break;
      case 'price_low':
        sortOption = { price: 1 };
        break;
      case 'popular':
        sortOption = { sales: -1 };
        break;
    }
    
    const skip = (page - 1) * limit;
    
    const [products, total] = await Promise.all([
      (Product as any).find(query)
        .sort(sortOption)
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
    console.error('All products error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get products' },
      { status: 500 }
    );
  }
}