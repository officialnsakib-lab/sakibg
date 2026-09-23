import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Withdrawal from '@/models/Withdrawal';
import { getUserFromCookie } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const decoded = await getUserFromCookie();
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const skip = (page - 1) * limit;
    
    const [withdrawals, total] = await Promise.all([
      (Withdrawal as any).find({ vendorId: decoded.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      (Withdrawal as any).countDocuments({ vendorId: decoded.userId })
    ]);
    
    return NextResponse.json(
      {
        success: true,
        data: {
          withdrawals,
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
    console.error('Withdrawal history error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get history' },
      { status: 500 }
    );
  }
}