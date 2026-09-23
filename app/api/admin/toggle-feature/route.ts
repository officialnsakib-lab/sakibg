import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import { getUserFromCookie } from '@/lib/auth';

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    
    const decoded = await getUserFromCookie();
    
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    const body = await req.json();
    const { productId, isFeatured } = body;
    
    const product = await (Product as any).findByIdAndUpdate(
      productId,
      { isFeatured },
      { new: true }
    );
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: 'Product updated', data: { product } },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Toggle feature error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update' },
      { status: 500 }
    );
  }
}
