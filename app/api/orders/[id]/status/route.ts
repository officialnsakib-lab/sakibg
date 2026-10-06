// app/api/orders/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import { getUserFromCookie } from '@/lib/auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const decoded = await getUserFromCookie();
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { orderStatus, paymentStatus, courierName, trackingNumber } = body;

    const order = await (Order as any).findById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const oldPaymentStatus = order.paymentStatus;

    // ✅ আপনার ডাটাবেজ মডেলের অনুমোদিত এনামের সাথে মিলিয়ে স্ট্যাটাস ম্যাপ করা হলো
    if (orderStatus) {
      const lowerStatus = String(orderStatus).toLowerCase();
      
      if (lowerStatus.includes('packing') || lowerStatus.includes('processing') || lowerStatus.includes('confirmed')) {
        order.orderStatus = 'confirmed'; // অথবা আপনার মডেলে যা আছে
      } else if (lowerStatus.includes('ship')) {
        // যদি আপনার মডেলে 'shipping'-এর পরিবর্তে 'shipped' থাকে
        order.orderStatus = 'shipped'; 
      } else if (lowerStatus.includes('receive') || lowerStatus.includes('complet') || lowerStatus.includes('deliver')) {
        // যদি আপনার মডেলে 'delivered'-এর পরিবর্তে 'completed' থাকে
        order.orderStatus = 'completed'; 
      } else if (lowerStatus.includes('cancel')) {
        order.orderStatus = 'cancelled';
      } else if (lowerStatus.includes('pending')) {
        order.orderStatus = 'pending';
      } else {
        order.orderStatus = lowerStatus;
      }
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    if (order.productType === 'physical') {
      if (courierName) order.courierName = courierName;
      if (trackingNumber) order.trackingNumber = trackingNumber;
    }

    await order.save();

    // ভেন্ডর ব্যালেন্স আপডেট
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
    console.error('Update status error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update order status' },
      { status: 500 }
    );
  }
}