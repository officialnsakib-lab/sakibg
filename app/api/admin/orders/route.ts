// app/api/admin/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User'; // ✅ ইউজার মডেল ইম্পোর্ট করা হয়েছে
import { getUserFromCookie } from '@/lib/auth';

// ১. এডমিন অর্ডারের তালিকা এবং স্ট্যাটিস্টিক্স পাওয়ার GET মেথড
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

// ২. পেমেন্ট এপ্রুভ এবং অর্ডার স্ট্যাটাস আপডেট করার PATCH মেথড
export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    const decoded = await getUserFromCookie();

    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { orderId, orderStatus, paymentStatus, courierName, trackingNumber } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const order = await (Order as any).findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const oldPaymentStatus = order.paymentStatus;

    // স্ট্যাটাস ফিল্ড আপডেট
    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    // ফিজিক্যাল প্রোডাক্টের জন্য শিপিং/কুরিয়ার আপডেট
    if (order.productType === 'physical') {
      if (courierName) order.courierName = courierName;
      if (trackingNumber) order.trackingNumber = trackingNumber;
    }

    // pre('save') হুক অনুযায়ী পেমেন্ট 'paid' অথবা অর্ডার 'completed' হলে স্বয়ংক্রিয়ভাবে ডাউনলোড টোকেন তৈরি হবে
    await order.save();

    // ✅ পেমেন্ট স্ট্যাটাস 'paid' বা 'completed' এ পরিবর্তিত হলে ভেন্ডরের ব্যালেন্স আপডেট হবে
    if (
      (paymentStatus === 'paid' || paymentStatus === 'completed') &&
      oldPaymentStatus !== 'paid' &&
      oldPaymentStatus !== 'completed'
    ) {
      if (order.vendorId && order.vendorAmount) {
        const vendor = await (User as any).findById(order.vendorId);
        if (vendor) {
          vendor.pendingIncome = Math.max(0, (vendor.pendingIncome || 0) - order.vendorAmount);
          vendor.totalEarnings = (vendor.totalEarnings || 0) + order.vendorAmount;
          await vendor.save();
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Order status updated successfully',
        data: order
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update order' },
      { status: 500 }
    );
  }
}