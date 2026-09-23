// app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Product from '@/models/Product';
import Order from '@/models/Order';
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
    
    // Get stats
    const [
      totalVendors,
      totalCustomers,
      totalProducts,
      pendingProducts,
      approvedProducts,
      rejectedProducts,
      totalWebsiteDemos,
      pendingWebsites,
      totalOrders,
      totalRevenue,
      recentProducts,
      topVendors
    ] = await Promise.all([
      (User as any).countDocuments({ role: 'vendor' }),
      (User as any).countDocuments({ role: 'customer' }),
      (Product as any).countDocuments({ productType: 'digital' }),
      (Product as any).countDocuments({ status: 'pending' }),
      (Product as any).countDocuments({ status: 'approved' }),
      (Product as any).countDocuments({ status: 'rejected' }),
      (Product as any).countDocuments({ productType: 'website' }),
      (Product as any).countDocuments({ productType: 'website', status: 'pending' }),
      (Order as any).countDocuments(),
      (Order as any).aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$price' } } }
      ]),
      (Product as any).find({ status: 'pending' })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('vendorId', 'name email'),
      (User as any).find({ role: 'vendor' })
        .sort({ totalSales: -1 })
        .limit(5)
        .select('name email totalSales totalEarnings commissionRate')
    ]);
    
    return NextResponse.json(
      {
        success: true,
        data: {
          stats: {
            totalVendors,
            totalCustomers,
            totalProducts,
            pendingProducts,
            approvedProducts,
            rejectedProducts,
            totalWebsiteDemos,
            pendingWebsites,
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0
          },
          recentProducts,
          topVendors
        }
      },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get stats' },
      { status: 500 }
    );
  }
}