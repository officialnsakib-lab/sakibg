import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const categories = await (Product as any).aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    return NextResponse.json(
      {
        success: true,
        data: {
          categories: categories.map((cat: any) => ({
            name: cat._id,
            count: cat.count
          }))
        }
      },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Categories error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}