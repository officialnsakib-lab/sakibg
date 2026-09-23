import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Review from '@/models/Review';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    await connectDB();
    
    const { productId } = await params;
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '5');
    const sort = searchParams.get('sort') || 'newest';
    
    let sortOption: any = { createdAt: -1 };
    if (sort === 'highest') sortOption = { rating: -1 };
    if (sort === 'lowest') sortOption = { rating: 1 };
    if (sort === 'likes') sortOption = { likes: -1 };
    
    const skip = (page - 1) * limit;
    
    const [reviews, total] = await Promise.all([
      (Review as any).find({ productId, status: 'approved' })
        .sort(sortOption)
        .skip(skip)
        .limit(limit),
      (Review as any).countDocuments({ productId, status: 'approved' })
    ]);
    
    return NextResponse.json(
      {
        success: true,
        data: {
          reviews,
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
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}