import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    let query: any = {};
    
    if (status !== 'all') {
      query.paymentStatus = status;
    }
    
    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { productTitle: { $regex: search, $options: 'i' } },
        { buyerName: { $regex: search, $options: 'i' } },
        { buyerEmail: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const [orders, total, stats] = await Promise.all([
      (Order as any).find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      (Order as any).countDocuments(query),
      (Order as any).aggregate([
        { $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$price' },
          totalCommission: { $sum: '$commissionAmount' },
          pendingOrders: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0] } },
          paidOrders: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] } }
        }}
      ])
    ]);
    
    return NextResponse.json(
      {
        success: true,
        data: {
          orders,
          stats: stats[0] || { totalOrders: 0, totalRevenue: 0, totalCommission: 0, pendingOrders: 0, paidOrders: 0 },
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
    console.error('Orders error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get orders' },
      { status: 500 }
    );
  }
}