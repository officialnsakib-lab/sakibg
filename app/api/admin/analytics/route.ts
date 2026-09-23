// app/api/admin/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Product from '@/models/Product';
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
    const range = searchParams.get('range') || '30days';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Calculate date range
    let dateFilter: any = {};
    const now = new Date();
    
    switch (range) {
      case '7days':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
        break;
      case '30days':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
        break;
      case '90days':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) } };
        break;
      case 'year':
        dateFilter = { createdAt: { $gte: new Date(now.getFullYear(), 0, 1) } };
        break;
      case 'custom':
        if (startDate && endDate) {
          dateFilter = {
            createdAt: {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          };
        }
        break;
      case 'all':
      default:
        dateFilter = {};
        break;
    }
    
    // Get totals
    const [
      totalRevenue,
      totalCommission,
      totalOrders,
      totalProducts,
      totalVendors,
      totalCustomers,
      orders,
      newVendors,
      newCustomers,
      newProducts
    ] = await Promise.all([
      (Order as any).aggregate([
        { $match: { ...dateFilter, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$price' } } }
      ]),
      (Order as any).aggregate([
        { $match: { ...dateFilter, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$commissionAmount' } } }
      ]),
      (Order as any).countDocuments(dateFilter),
      (Product as any).countDocuments(dateFilter),
      (User as any).countDocuments({ role: 'vendor' }),
      (User as any).countDocuments({ role: 'customer' }),
      (Order as any).find(dateFilter).sort({ createdAt: -1 }).select('price commissionAmount createdAt'),
      (User as any).find({ role: 'vendor', ...dateFilter }).select('createdAt'),
      (User as any).find({ role: 'customer', ...dateFilter }).select('createdAt'),
      (Product as any).find(dateFilter).select('createdAt')
    ]);
    
    // Calculate daily stats
    const dailyMap = new Map();
    
    // Initialize dates
    const days = range === '7days' ? 7 : range === '30days' ? 30 : range === '90days' ? 90 : 30;
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split('T')[0];
      dailyMap.set(dateKey, {
        date: dateKey,
        orders: 0,
        revenue: 0,
        commission: 0,
        newVendors: 0,
        newCustomers: 0,
        newProducts: 0
      });
    }
    
    // Add orders
    orders.forEach((order: any) => {
      const dateKey = new Date(order.createdAt).toISOString().split('T')[0];
      if (dailyMap.has(dateKey)) {
        const day = dailyMap.get(dateKey);
        day.orders += 1;
        day.revenue += order.price || 0;
        day.commission += order.commissionAmount || 0;
      }
    });
    
    // Add new vendors
    newVendors.forEach((vendor: any) => {
      const dateKey = new Date(vendor.createdAt).toISOString().split('T')[0];
      if (dailyMap.has(dateKey)) {
        dailyMap.get(dateKey).newVendors += 1;
      }
    });
    
    // Add new customers
    newCustomers.forEach((customer: any) => {
      const dateKey = new Date(customer.createdAt).toISOString().split('T')[0];
      if (dailyMap.has(dateKey)) {
        dailyMap.get(dateKey).newCustomers += 1;
      }
    });
    
    // Add new products
    newProducts.forEach((product: any) => {
      const dateKey = new Date(product.createdAt).toISOString().split('T')[0];
      if (dailyMap.has(dateKey)) {
        dailyMap.get(dateKey).newProducts += 1;
      }
    });
    
    const dailyStats = Array.from(dailyMap.values());
    
    // Category stats
    const categoryStats = await (Product as any).aggregate([
      { $match: { status: 'approved' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          revenue: { $sum: '$revenue' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    return NextResponse.json(
      {
        success: true,
        data: {
          analytics: {
            totalRevenue: totalRevenue[0]?.total || 0,
            totalCommission: totalCommission[0]?.total || 0,
            totalVendorEarnings: (totalRevenue[0]?.total || 0) - (totalCommission[0]?.total || 0),
            totalOrders,
            totalProducts,
            totalVendors,
            totalCustomers,
            dailyStats,
            categoryStats: categoryStats.map((cat: any) => ({
              category: cat._id,
              count: cat.count,
              revenue: cat.revenue
            }))
          }
        }
      },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get analytics' },
      { status: 500 }
    );
  }
}