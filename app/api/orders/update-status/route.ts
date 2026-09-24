import { NextResponse } from 'next/server';
import Order from '@/models/Order';
import User from '@/models/User'; // ✅ ইউজার মডেল ইম্পোর্ট করুন

export async function PATCH(req: Request) {
  try {
    const { orderId, orderStatus, paymentStatus, courierName, trackingNumber } = await req.json();

    const order = await Order.findOne({ orderId });
    if (!order) {
      return NextResponse.json({ error: 'order_not_found' }, { status: 404 });
    }

    const oldPaymentStatus = order.paymentStatus;

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    // ফিজিক্যাল প্রোডাক্টের জন্য শিপিং ডিটেইলস
    if (order.productType === 'physical') {
      if (courierName) order.courierName = courierName;
      if (trackingNumber) order.trackingNumber = trackingNumber;
    }

    await order.save();

    // ✅ পেমেন্ট স্ট্যাটাস যদি 'paid' বা 'completed' এ পরিবর্তিত হয় (আগে যদি pending থাকে)
    if (
      (paymentStatus === 'paid' || paymentStatus === 'completed') &&
      oldPaymentStatus !== 'paid' &&
      oldPaymentStatus !== 'completed'
    ) {
      if (order.vendorId && order.vendorAmount) {
        const vendor = await User.findById(order.vendorId);
        if (vendor) {
          // pendingIncome থেকে কমিয়ে totalEarnings এ যোগ করুন
          vendor.pendingIncome = Math.max(0, (vendor.pendingIncome || 0) - order.vendorAmount);
          vendor.totalEarnings = (vendor.totalEarnings || 0) + order.vendorAmount;
          await vendor.save();
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'অর্ডার স্ট্যাটাস এবং ভেন্ডর আর্নিং সফলভাবে আপডেট করা হয়েছে।', 
      order 
    });
  } catch (error: any) {
    console.error('Update status error:', error);
    return NextResponse.json({ error: error.message || 'update_failed' }, { status: 500 });
  }
}