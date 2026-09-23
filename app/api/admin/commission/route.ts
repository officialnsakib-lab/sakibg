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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const skip = (page - 1) * limit;
    
    const [vendors, total, defaultVendor] = await Promise.all([
      (User as any).find({ role: 'vendor' })
        .sort({ totalSales: -1 })
        .skip(skip)
        .limit(limit)
        .select('name email commissionRate totalSales totalEarnings totalProducts averageRating'),
      (User as any).countDocuments({ role: 'vendor' }),
      (User as any).findOne({ role: 'vendor' }).select('commissionRate')
    ]);
    
    return NextResponse.json(
      {
        success: true,
        data: {
          vendors,
          defaultCommission: defaultVendor?.commissionRate || 10,
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
    console.error('Commission error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get data' },
      { status: 500 }
    );
  }
}

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
    const { vendorId, commissionRate, defaultCommission } = body;
    
    if (defaultCommission) {
      await (User as any).updateMany(
        { role: 'vendor' },
        { commissionRate: defaultCommission }
      );
      
      return NextResponse.json(
        { success: true, message: 'Default commission updated' },
        { status: 200 }
      );
    }
    
    if (vendorId && commissionRate !== undefined) {
      if (commissionRate < 0 || commissionRate > 100) {
        return NextResponse.json(
          { success: false, error: 'Commission must be between 0-100%' },
          { status: 400 }
        );
      }
      
      await (User as any).findByIdAndUpdate(
        vendorId,
        { commissionRate }
      );
      
      return NextResponse.json(
        { success: true, message: 'Commission updated' },
        { status: 200 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
    
  } catch (error: any) {
    console.error('Update commission error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update' },
      { status: 500 }
    );
  }
}